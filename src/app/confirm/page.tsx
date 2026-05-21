"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db, formatUSD } from "@/lib/db";
import { useActiveScenario } from "@/lib/activeQuote";
import { Wordmark } from "@/components/Wordmark";

const CATEGORY_LABEL: Record<string, string> = {
  seed: "Seed",
  fertilizer: "Fertilizer",
  crop_protection: "Crop protection",
  irrigation: "Irrigation",
  crop_insurance: "Crop insurance",
};

export default function ConfirmPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const scenario = useActiveScenario();

  if (!scenario) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10">
        <div className="mx-auto max-w-md text-center">
          <Wordmark subtle />
          <p className="mt-10 text-sm text-stone-600">
            No quote loaded yet. Upload one to get started.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-block rounded-lg bg-green-800 px-5 py-3 text-sm font-semibold text-white hover:bg-green-900"
          >
            Upload a quote
          </Link>
        </div>
      </main>
    );
  }

  const tomQuote = scenario.quote;

  function runAnalysis() {
    setAnalyzing(true);
    setTimeout(() => router.push("/verdict"), 1100);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <Wordmark subtle />
          <Link href="/upload" className="text-sm text-stone-500 hover:text-stone-800">
            ← Re-upload
          </Link>
        </header>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-700 font-serif text-base font-semibold text-white">
            S
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm bg-white p-4 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200">
            {db.ui_strings.sarah_confirmation_intro}
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-4 py-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
              Quote summary
            </div>
            <div className="mt-1 font-semibold text-stone-900">{tomQuote.supplier_display}</div>
            <div className="mt-0.5 text-xs text-stone-600">
              {tomQuote.quote_date} · {tomQuote.acres_covered} acres · corn (furrow-irrigated)
            </div>
          </div>

          <ul className="divide-y divide-stone-200">
            {tomQuote.line_items.map((li) => {
              const flagged = li.category === "fertilizer";
              return (
                <li key={li.category} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        {CATEGORY_LABEL[li.category] ?? li.category}
                      </div>
                      <div className="text-sm text-stone-800">{li.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-base font-semibold text-stone-900">
                        {formatUSD(li.price_per_acre, { cents: true })}
                      </div>
                      <div className="text-[10px] text-stone-500">per acre</div>
                    </div>
                  </div>
                  {flagged && "components" in li && li.components && (
                    <ul className="mt-2 ml-1 space-y-0.5 text-xs text-stone-600">
                      {li.components.map((c) => (
                        <li key={c.label} className="flex justify-between">
                          <span>· {c.label}</span>
                          <span className="font-mono">{formatUSD(c.price_per_acre, { cents: true })}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-1 text-[10px] text-stone-400">
                    OCR confidence {Math.round((li.extracted_confidence ?? 0) * 100)}%
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-baseline justify-between border-t border-stone-200 bg-stone-50 px-4 py-3">
            <div className="text-sm font-semibold text-stone-800">Total quoted</div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold text-stone-900">
                {formatUSD(tomQuote.total_quoted_per_acre, { cents: true })}/ac
              </div>
              <div className="text-xs text-stone-500">
                {formatUSD(tomQuote.total_quoted_full_operation)} across {tomQuote.acres_covered} ac
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={analyzing}
            className="block w-full rounded-lg bg-green-800 px-4 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:bg-green-900 active:bg-green-950 disabled:opacity-70"
          >
            {analyzing ? "Comparing against 28 SE Missouri farms…" : "Looks right — run the analysis"}
          </button>
          <button
            type="button"
            className="block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Edit a line item
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-stone-500">
          Your quote stays private — peer comparisons are anonymized (minimum 5 farms).
        </p>
      </div>
    </main>
  );
}
