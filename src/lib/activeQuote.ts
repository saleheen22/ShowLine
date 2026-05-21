"use client";

import { useEffect, useState } from "react";
import { db } from "./db";

const STORAGE_KEY = "showline_ai_analysis_v2";
const LEGACY_KEY = "showline_active_scenario_id";

export type CategoryKey =
  | "seed"
  | "fertilizer"
  | "crop_protection"
  | "irrigation"
  | "crop_insurance";

export type StatusColor = "green" | "amber" | "red";

export type AILineItem = {
  category: CategoryKey;
  description: string;
  price_per_acre: number;
  extracted_confidence: number;
  components?: Array<{ label: string; price_per_acre: number }>;
};

export type AICategoryAssessment = {
  category: CategoryKey;
  label: string;
  your_per_acre: number;
  percentile: number;
  commentary: string;
  status_color: StatusColor;
};

export type AIPrimaryFinding = {
  category: CategoryKey;
  your_per_acre: number;
  peer_paid_median_per_acre: number;
  mu_extension_per_acre: number;
  peer_paid_n: number;
  peer_paid_radius_miles: number;
  mu_extension_citation: string;
  gap_per_acre: number;
  gap_full_operation: number;
  status_color: StatusColor;
};

export type AIVerdictTile = {
  label: string;
  value: string;
  subline: string;
  tint: "red" | "amber" | "green" | "neutral";
};

export type AIAnalysis = {
  supplier_display: string;
  supplier_short: string;
  farmer_name: string | null;
  farm_internal_name: string | null;
  county: string | null;
  state: string;
  total_acres: number | null;
  acres_covered: number;
  quote_date: string;
  ocr_confidence: number;
  line_items: AILineItem[];
  total_quoted_per_acre: number;
  total_quoted_full_operation: number;
  verdict: "FAIR" | "NEGOTIABLE" | "OVERPRICED";
  verdict_color: StatusColor;
  headline: string;
  narrative_summary: string;
  estimated_overpayment_per_acre: number;
  estimated_overpayment_dollars: number;
  primary_finding: AIPrimaryFinding;
  category_assessments: AICategoryAssessment[];
  verdict_tiles: AIVerdictTile[];
  recommended_actions: string[];
  report_summary_sentences: string[];
};

export type ScenarioQuote = {
  id: string;
  is_demo_quote: boolean;
  farm_id: string;
  user_id: string;
  supplier_id: string;
  supplier_display: string;
  crop: string;
  production_system: string;
  quote_date: string;
  uploaded_at: string;
  source: string;
  acres_covered: number;
  ocr_confidence: number;
  sarah_notes: string;
  line_items: AILineItem[];
  total_quoted_per_acre: number;
  total_quoted_full_operation: number;
};

export type ScenarioVerdict = {
  id: string;
  quote_id: string;
  farm_id: string;
  computed_at: string;
  verdict: AIAnalysis["verdict"];
  color: StatusColor;
  headline: string;
  estimated_overpayment_dollars: number;
  estimated_overpayment_acres: number;
  estimated_overpayment_per_acre: number;
  narrative_summary: string;
  why_panel: {
    primary_finding: AIPrimaryFinding;
    in_range: AICategoryAssessment[];
    amber_items: AICategoryAssessment[];
  };
  verdict_tiles: AIVerdictTile[];
  recommended_actions: string[];
};

export type ScenarioReport = {
  id: string;
  verdict_id: string;
  farm_id: string;
  generated_at: string;
  title: string;
  subtitle: string;
  verdict_line: string;
  share_link_token: string;
  share_link_expires_at: string;
  summary_sentences: string[];
};

export type Scenario = {
  ai: AIAnalysis;
  supplier_display: string;
  supplier_short: string;
  farmer_name: string;
  farm_internal_name: string;
  county: string;
  state: string;
  total_acres: number;
  quote: ScenarioQuote;
  verdict: ScenarioVerdict;
  report: ScenarioReport;
};

function shortToken(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rnd}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function buildScenarioFromAnalysis(ai: AIAnalysis): Scenario {
  const farmId = shortToken("farm");
  const quoteId = shortToken("quote");
  const verdictId = shortToken("verdict");
  const reportId = shortToken("report");
  const userId = shortToken("usr");
  const supplierId = shortToken("sup");
  const now = isoNow();

  const farmName = ai.farm_internal_name ?? `${ai.county ?? "Your"} County operation`;
  const farmer = ai.farmer_name ?? "Operator";
  const county = ai.county ?? "—";
  const state = ai.state ?? "MO";
  const totalAcres = ai.total_acres ?? ai.acres_covered;

  const inRange = ai.category_assessments.filter(
    (c) => c.status_color === "green" && c.category !== ai.primary_finding.category,
  );
  const amberOrRed = ai.category_assessments.filter(
    (c) =>
      c.category !== ai.primary_finding.category &&
      (c.status_color === "amber" || c.status_color === "red"),
  );

  const quote: ScenarioQuote = {
    id: quoteId,
    is_demo_quote: false,
    farm_id: farmId,
    user_id: userId,
    supplier_id: supplierId,
    supplier_display: ai.supplier_display,
    crop: "corn",
    production_system: "furrow-irrigated",
    quote_date: ai.quote_date,
    uploaded_at: now,
    source: "ai_extract",
    acres_covered: ai.acres_covered,
    ocr_confidence: ai.ocr_confidence,
    sarah_notes: `Extracted by AI from uploaded document. Supplier: ${ai.supplier_display}. ${ai.line_items.length} line items at avg confidence ${Math.round(
      (ai.line_items.reduce((s, l) => s + (l.extracted_confidence ?? 0), 0) /
        Math.max(1, ai.line_items.length)) * 100,
    )}%.`,
    line_items: ai.line_items,
    total_quoted_per_acre: ai.total_quoted_per_acre,
    total_quoted_full_operation: ai.total_quoted_full_operation,
  };

  const verdict: ScenarioVerdict = {
    id: verdictId,
    quote_id: quoteId,
    farm_id: farmId,
    computed_at: now,
    verdict: ai.verdict,
    color: ai.verdict_color,
    headline: ai.headline,
    estimated_overpayment_dollars: ai.estimated_overpayment_dollars,
    estimated_overpayment_acres: ai.acres_covered,
    estimated_overpayment_per_acre: ai.estimated_overpayment_per_acre,
    narrative_summary: ai.narrative_summary,
    why_panel: {
      primary_finding: ai.primary_finding,
      in_range: inRange,
      amber_items: amberOrRed,
    },
    verdict_tiles: ai.verdict_tiles,
    recommended_actions: ai.recommended_actions,
  };

  const verdictLineMoney =
    ai.estimated_overpayment_dollars > 0
      ? ` — $${ai.estimated_overpayment_dollars.toLocaleString()} estimated overpayment`
      : " — priced in line with peers";

  const report: ScenarioReport = {
    id: reportId,
    verdict_id: verdictId,
    farm_id: farmId,
    generated_at: now,
    title: `Input cost analysis — ${farmName}, 2026 corn`,
    subtitle: "Independent third-party benchmark for lender review",
    verdict_line: `${ai.verdict}${verdictLineMoney}`,
    share_link_token: shortToken("sl"),
    share_link_expires_at: isoPlusDays(30),
    summary_sentences: ai.report_summary_sentences,
  };

  return {
    ai,
    supplier_display: ai.supplier_display,
    supplier_short: ai.supplier_short,
    farmer_name: farmer,
    farm_internal_name: farmName,
    county,
    state,
    total_acres: totalAcres,
    quote,
    verdict,
    report,
  };
}

export function setActiveAnalysis(ai: AIAnalysis) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ai));
  // Notify other tabs / pages in this session.
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function clearActiveAnalysis() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(LEGACY_KEY);
  window.localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function readActiveAnalysis(): AIAnalysis | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AIAnalysis;
  } catch {
    return null;
  }
}

export function useActiveAnalysis(): { analysis: AIAnalysis | null; scenario: Scenario | null } {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    setAnalysis(readActiveAnalysis());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY || e.key === null) {
        setAnalysis(readActiveAnalysis());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    analysis,
    scenario: analysis ? buildScenarioFromAnalysis(analysis) : null,
  };
}

// Legacy alias for pages that haven't been updated yet.
export function useActiveScenario(): Scenario | null {
  return useActiveAnalysis().scenario;
}

// Re-export db so existing imports through this module keep working.
export { db };
