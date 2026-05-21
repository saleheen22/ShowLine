import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-opus-4";

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

function benchmarkContext() {
  const b = db.peer_benchmarks_aggregated;
  return {
    region: b.region,
    crop: b.crop,
    production_system: b.production_system,
    radius_miles: b.radius_miles,
    peer_farm_count_in_radius: b.peer_farm_count_in_radius,
    as_of: b.as_of,
    by_category: Object.fromEntries(
      Object.entries(b.by_category).map(([k, v]) => [
        k,
        {
          peer_paid_median: v.peer_paid.median,
          peer_paid_p25: v.peer_paid.p25,
          peer_paid_p75: v.peer_paid.p75,
          peer_paid_n: v.peer_paid.n,
          peer_quoted_median: v.peer_quoted.median,
          mu_extension_reference: v.mu_extension_reference,
        },
      ]),
    ),
  };
}

const SYSTEM_PROMPT = `You are Showline's analyst AI. You receive a Missouri farmer's corn-input quote (image or PDF) from a co-op or ag supplier. You extract every line item, then compare against real SE Missouri peer-paid medians and University of Missouri Extension 2026 references provided in the user message, and produce a structured verdict.

Categories you must map every line to (use these exact strings): "seed", "fertilizer", "crop_protection", "irrigation", "crop_insurance". If a line bundles multiple things, split if obvious; otherwise pick the dominant category. If a category is genuinely absent from the quote, omit it from line_items.

Verdict rules:
- "FAIR" (green) — every category within ~5% of peer paid median; total operation-wide gap under $5,000.
- "NEGOTIABLE" (amber) — one or two categories materially over peer median, OR $5,000-$15,000 gap total.
- "OVERPRICED" (red) — three or more categories high, OR more than $15,000 gap total.

Per-category status_color:
- "green" if at or below peer paid median
- "amber" if between median and 75th percentile
- "red" if above 75th percentile

Output STRICT JSON only, matching this TypeScript shape exactly. No prose, no markdown fences:

{
  "supplier_display": string,           // full name from header, e.g. "MFA Sikeston Branch"
  "supplier_short": string,             // short form, 1-2 words, e.g. "MFA"
  "farmer_name": string | null,
  "farm_internal_name": string | null,  // farm/operation name if printed
  "county": string | null,              // Missouri county if inferable
  "state": string,                      // 2-letter, default "MO"
  "total_acres": number | null,         // operation total if printed
  "acres_covered": number,              // acres this quote covers
  "quote_date": string,                 // ISO YYYY-MM-DD
  "ocr_confidence": number,             // 0-1 your overall confidence reading the doc
  "line_items": [
    {
      "category": "seed" | "fertilizer" | "crop_protection" | "irrigation" | "crop_insurance",
      "description": string,
      "price_per_acre": number,
      "extracted_confidence": number,   // 0-1
      "components"?: [{ "label": string, "price_per_acre": number }]
    }
  ],
  "total_quoted_per_acre": number,
  "total_quoted_full_operation": number,
  "verdict": "FAIR" | "NEGOTIABLE" | "OVERPRICED",
  "verdict_color": "green" | "amber" | "red",
  "headline": string,                   // <=80 chars, plain English, action-oriented
  "narrative_summary": string,          // 3-5 sentences naming the SPECIFIC supplier and the SPECIFIC categories
  "estimated_overpayment_per_acre": number,
  "estimated_overpayment_dollars": number,
  "primary_finding": {
    "category": "seed" | "fertilizer" | "crop_protection" | "irrigation" | "crop_insurance",
    "your_per_acre": number,
    "peer_paid_median_per_acre": number,
    "mu_extension_per_acre": number,
    "peer_paid_n": number,
    "peer_paid_radius_miles": number,
    "mu_extension_citation": string,    // use "MU Extension g658, SE MO Corn Planning Budget 2026"
    "gap_per_acre": number,
    "gap_full_operation": number,
    "status_color": "green" | "amber" | "red"
  },
  "category_assessments": [
    {
      "category": "seed" | "fertilizer" | "crop_protection" | "irrigation" | "crop_insurance",
      "label": string,                  // "Seed" | "Fertilizer" | "Crop protection" | "Irrigation" | "Crop insurance"
      "your_per_acre": number,
      "percentile": number,             // 0-100 vs peer paid
      "commentary": string,             // one short clause
      "status_color": "green" | "amber" | "red"
    }
  ],
  "verdict_tiles": [
    { "label": string, "value": string, "subline": string, "tint": "red" | "amber" | "green" | "neutral" }
  ],
  "recommended_actions": [string, string, string],   // exactly 3, naming the supplier_short from this quote
  "report_summary_sentences": [string, string, string, string]  // 4 sentences for the lender report
}

Rules:
- Use the SUPPLIER NAME extracted from the document in recommended_actions (e.g. "Ask <supplier_short> to re-quote..."). NEVER hardcode "MFA" unless that's what the document says.
- All dollar amounts in USD, no currency symbols in numeric fields.
- estimated_overpayment_dollars = max(0, sum over categories of (your - peer_paid_median) * acres_covered) for categories where your > peer_paid_median.
- If the quote is genuinely fair across the board, estimated_overpayment_dollars = 0 and verdict = "FAIR".
- primary_finding is the single biggest dollar gap. If no gap exists, set primary_finding to the highest-percentile category and note it's in line.
- Round prices to 2 decimals; round operation-wide dollars to nearest whole dollar.
- verdict_tiles: 3 tiles. First = "YOUR <CATEGORY>" of primary finding. Second = "PEER MEDIAN". Third = "MU EXTENSION 2026".`;

type AnalysisResult = unknown;

async function callOpenRouter(
  apiKey: string,
  model: string,
  appName: string,
  fileDataUrl: string,
  mime: string,
  filename: string,
): Promise<{ result: AnalysisResult; usage?: unknown }> {
  const benchmarks = benchmarkContext();

  const userContent: Array<Record<string, unknown>> = [
    {
      type: "text",
      text:
        `Analyze this Missouri farmer's corn-input quote.\n\nReference data (use these EXACT numbers when computing gaps and percentiles):\n` +
        JSON.stringify(benchmarks, null, 2) +
        `\n\nThe document is attached. Return ONLY the JSON object specified in the system prompt.`,
    },
  ];

  if (mime === "application/pdf") {
    userContent.push({
      type: "file",
      file: {
        filename,
        file_data: fileDataUrl,
      },
    });
  } else {
    userContent.push({
      type: "image_url",
      image_url: { url: fileDataUrl },
    });
  }

  const body = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 4000,
    plugins:
      mime === "application/pdf"
        ? [{ id: "file-parser", pdf: { engine: "pdf-text" } }]
        : undefined,
  };

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://showline.local",
      "X-Title": appName,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: unknown;
    error?: { message?: string };
  };

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message ?? JSON.stringify(data.error)}`);
  }

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenRouter returned no message content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end < 0) {
      throw new Error("Model did not return valid JSON: " + raw.slice(0, 200));
    }
    parsed = JSON.parse(raw.slice(start, end + 1));
  }

  return { result: parsed, usage: data.usage };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonError(500, "OPENROUTER_API_KEY is not set. Add it to .env.local and restart the dev server.");
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const appName = process.env.OPENROUTER_APP_NAME || "Showline";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    return jsonError(400, "Could not parse form data: " + (e as Error).message);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "No file uploaded. Send a multipart form with field 'file'.");
  }

  const mime = file.type || "application/octet-stream";
  if (!ACCEPTED_MIME.has(mime)) {
    return jsonError(415, `Unsupported file type: ${mime}. Send a JPEG, PNG, WebP, HEIC, or PDF.`);
  }

  if (file.size > 15 * 1024 * 1024) {
    return jsonError(413, "File too large. Max 15 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  try {
    const { result, usage } = await callOpenRouter(apiKey, model, appName, dataUrl, mime, file.name);
    return Response.json({ analysis: result, model, usage });
  } catch (e) {
    const msg = (e as Error).message;
    return jsonError(502, "AI analysis failed", { detail: msg });
  }
}
