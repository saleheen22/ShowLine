import Link from "next/link";
import { tomVerdict, tomQuote, formatUSD } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

const TILE_TINT: Record<string, string> = {
  red: "bg-red-50 border-red-200 text-red-900",
  amber: "bg-amber-50 border-amber-200 text-amber-900",
  green: "bg-green-50 border-green-200 text-green-900",
  neutral: "bg-stone-50 border-stone-200 text-stone-800",
};

const DOT_COLOR: Record<string, string> = {
  red: "bg-red-600",
  amber: "bg-amber-500",
  green: "bg-green-600",
};

export default function VerdictPage() {
  const v = tomVerdict;
  const why = v.why_panel;

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 pb-24">
      <div className="mx-auto max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <Wordmark subtle />
          <Link href="/confirm" className="text-sm text-stone-500 hover:text-stone-800">
            ← Quote
          </Link>
        </header>

        <section className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              {v.verdict}
            </span>
          </div>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-stone-900">
            {v.headline}
          </h2>
          <div className="mt-4 rounded-lg bg-white/70 p-3 ring-1 ring-amber-200">
            <div className="text-xs uppercase tracking-wide text-stone-500">
              Estimated overpayment
            </div>
            <div className="mt-1 font-mono text-3xl font-bold text-stone-900">
              {formatUSD(v.estimated_overpayment_dollars)}
            </div>
            <div className="text-xs text-stone-600">
              {formatUSD(v.estimated_overpayment_per_acre, { cents: true })}/acre across{" "}
              {v.estimated_overpayment_acres} acres
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-3 gap-2">
            {v.verdict_tiles.map((t) => (
              <div
                key={t.label}
                className={`rounded-lg border p-3 ${TILE_TINT[t.tint] ?? TILE_TINT.neutral}`}
              >
                <div className="text-[9px] font-semibold uppercase tracking-wide opacity-70">
                  {t.label}
                </div>
                <div className="mt-1 font-mono text-base font-bold leading-tight">{t.value}</div>
                <div className="mt-0.5 text-[10px] opacity-70">{t.subline}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-serif text-lg text-stone-900">Why</h3>
          <div className="mt-3 rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm ring-1 ring-stone-200">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-red-700">
              Primary finding
            </div>
            <div className="mt-1 text-lg font-semibold text-stone-900">Fertilizer</div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <span className="text-stone-500">Your quote</span>
              <span className="text-right font-mono font-semibold text-stone-900">
                {formatUSD(why.primary_finding.your_per_acre, { cents: true })}/ac
              </span>
              <span className="text-stone-500">Peer paid median</span>
              <span className="text-right font-mono text-stone-700">
                {formatUSD(why.primary_finding.peer_paid_median_per_acre, { cents: true })}/ac
              </span>
              <span className="text-stone-500">MU Extension 2026</span>
              <span className="text-right font-mono text-stone-700">
                {formatUSD(why.primary_finding.mu_extension_per_acre, { cents: true })}/ac
              </span>
              <span className="border-t border-stone-200 pt-1 font-semibold text-red-700">
                Gap
              </span>
              <span className="border-t border-stone-200 pt-1 text-right font-mono font-bold text-red-700">
                +{formatUSD(why.primary_finding.gap_per_acre, { cents: true })}/ac · {formatUSD(why.primary_finding.gap_full_operation)}
              </span>
            </div>
            <div className="mt-3 text-[10px] text-stone-500">
              {why.primary_finding.peer_paid_n} similar farms within{" "}
              {why.primary_finding.peer_paid_radius_miles} miles · {why.primary_finding.mu_extension_citation}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {[...why.in_range, ...why.amber_items].map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 rounded-full ${DOT_COLOR[item.status_color] ?? "bg-stone-400"}`}
                  />
                  <div>
                    <div className="text-sm font-medium text-stone-900">{item.label}</div>
                    <div className="text-[11px] text-stone-500">{item.commentary}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-stone-800">
                    {formatUSD(item.your_per_acre, { cents: true })}
                  </div>
                  <div className="text-[10px] text-stone-500">p{item.percentile}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-stone-900 p-5 text-stone-100 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-green-400">
            What Sarah suggests
          </div>
          <ol className="mt-3 space-y-2.5 text-sm">
            {v.recommended_actions.map((a, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-700 text-[11px] font-bold">
                  {i + 1}
                </span>
                <span className="leading-snug">{a}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="font-serif text-base text-stone-900">Narrative summary</h3>
          <p className="mt-2 text-xs leading-relaxed text-stone-700">{v.narrative_summary}</p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/map"
            className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            See peer map
          </Link>
          <Link
            href="/scenario"
            className="rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-900"
          >
            Run scenarios →
          </Link>
        </div>

        <Link
          href="/report"
          className="mt-3 block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          📄 Generate lender report
        </Link>

        <div className="mt-3 text-center text-[11px] text-stone-500">
          Total quote {formatUSD(tomQuote.total_quoted_full_operation)} ·{" "}
          {tomQuote.acres_covered} acres
        </div>
      </div>
    </main>
  );
}
