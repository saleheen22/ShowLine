import Link from "next/link";
import {
  db,
  tomReport,
  tomVerdict,
  tomQuote,
  muellerFarm,
  tom,
  formatUSD,
} from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

const peer = db.peer_benchmarks_aggregated.by_category;

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 pb-24 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl print:max-w-none">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Wordmark subtle />
          <Link href="/verdict" className="text-sm text-stone-500 hover:text-stone-800">
            ← Verdict
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
          <a
            href="javascript:window.print()"
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Print / Save as PDF
          </a>
          <button
            type="button"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Email to lender
          </button>
          <span className="ml-auto rounded-full bg-green-50 px-3 py-1 text-[10px] font-medium text-green-800 ring-1 ring-green-200">
            Share link expires{" "}
            {new Date(tomReport.share_link_expires_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <article className="rounded-lg border border-stone-300 bg-white p-10 shadow-md print:rounded-none print:border-0 print:p-12 print:shadow-none">
          <header className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div>
              <div
                className="font-serif text-2xl tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Showline
              </div>
              <div className="mt-0.5 h-px w-8 bg-green-700" />
              <div className="mt-1 text-[10px] uppercase tracking-widest text-stone-500">
                Independent cost analysis
              </div>
            </div>
            <div className="text-right text-[10px] text-stone-500">
              <div className="font-mono">REPORT {tomReport.id.toUpperCase()}</div>
              <div className="mt-0.5">
                Generated{" "}
                {new Date(tomReport.generated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="mt-0.5">Share token {tomReport.share_link_token}</div>
            </div>
          </header>

          <div className="mt-6">
            <h1 className="font-serif text-3xl text-stone-900">{tomReport.title}</h1>
            <p className="mt-1 text-base text-stone-600">{tomReport.subtitle}</p>
          </div>

          <section className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 rounded-lg bg-stone-50 p-5 text-sm">
            <div>
              <div className="text-[10px] font-semibold uppercase text-stone-500">
                Borrower
              </div>
              <div className="mt-0.5 text-stone-900">{tom.display_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-stone-500">
                Operation
              </div>
              <div className="mt-0.5 text-stone-900">{muellerFarm.internal_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-stone-500">
                Location
              </div>
              <div className="mt-0.5 text-stone-900">
                {muellerFarm.county} County, {muellerFarm.state} ·{" "}
                {muellerFarm.total_acres.toLocaleString()} acres
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-stone-500">
                Quote analyzed
              </div>
              <div className="mt-0.5 text-stone-900">
                {tomQuote.supplier_display} · {tomQuote.acres_covered} corn acres
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border-l-4 border-amber-500 bg-amber-50/60 p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Verdict
            </div>
            <div className="mt-1 font-serif text-2xl text-stone-900">
              {tomReport.verdict_line}
            </div>
          </section>

          <section className="mt-7">
            <h2 className="font-serif text-lg text-stone-900">Cost line-by-line</h2>
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-stone-300 bg-stone-50 text-[10px] font-semibold uppercase text-stone-600">
                  <th className="px-2 py-2 text-left">Category</th>
                  <th className="px-2 py-2 text-right">Quoted</th>
                  <th className="px-2 py-2 text-right">Peer paid median</th>
                  <th className="px-2 py-2 text-right">MU 2026</th>
                  <th className="px-2 py-2 text-right">Gap / acre</th>
                  <th className="px-2 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {Object.entries(peer).map(([key, c]) => {
                  const gap = c.your_quote_per_acre - c.peer_paid.median;
                  const label =
                    key === "seed"
                      ? "Seed"
                      : key === "fertilizer"
                        ? "Fertilizer"
                        : key === "crop_protection"
                          ? "Crop protection"
                          : key === "irrigation"
                            ? "Irrigation"
                            : "Crop insurance";
                  const statusColor =
                    c.status_color === "red"
                      ? "text-red-700"
                      : c.status_color === "amber"
                        ? "text-amber-700"
                        : "text-green-700";
                  return (
                    <tr key={key} className="text-stone-800">
                      <td className="px-2 py-2">{label}</td>
                      <td className="px-2 py-2 text-right font-mono">
                        {formatUSD(c.your_quote_per_acre, { cents: true })}
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-stone-600">
                        {formatUSD(c.peer_paid.median, { cents: true })}
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-stone-600">
                        {formatUSD(c.mu_extension_reference, { cents: true })}
                      </td>
                      <td
                        className={`px-2 py-2 text-right font-mono ${gap > 0 ? "text-red-700" : "text-stone-500"}`}
                      >
                        {gap > 0 ? "+" : ""}
                        {formatUSD(gap, { cents: true })}
                      </td>
                      <td
                        className={`px-2 py-2 text-right text-[11px] font-semibold uppercase ${statusColor}`}
                      >
                        {c.status_color}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-stone-300 bg-stone-50 font-semibold">
                  <td className="px-2 py-2">Total per acre</td>
                  <td className="px-2 py-2 text-right font-mono text-stone-900">
                    {formatUSD(tomQuote.total_quoted_per_acre, { cents: true })}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-stone-600" colSpan={2}>
                    {formatUSD(603, { cents: true })}{" "}
                    <span className="font-normal text-[10px] text-stone-500">if negotiated</span>
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-red-700">
                    +{formatUSD(55, { cents: true })}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mt-7 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="text-[10px] font-semibold uppercase text-red-700">
                Overpayment
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-red-700">
                {formatUSD(tomVerdict.estimated_overpayment_dollars)}
              </div>
              <div className="text-[10px] text-red-700/80">
                {formatUSD(tomVerdict.estimated_overpayment_per_acre, { cents: true })}/ac
              </div>
            </div>
            <div className="rounded-lg border border-stone-300 bg-stone-50 p-4">
              <div className="text-[10px] font-semibold uppercase text-stone-600">
                Acres
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-stone-900">
                {tomQuote.acres_covered}
              </div>
              <div className="text-[10px] text-stone-500">corn (irrigated)</div>
            </div>
            <div className="rounded-lg border border-green-300 bg-green-50 p-4">
              <div className="text-[10px] font-semibold uppercase text-green-700">
                If negotiated
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-green-800">
                +{formatUSD(33000)}
              </div>
              <div className="text-[10px] text-green-700">added to season margin</div>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="font-serif text-lg text-stone-900">Summary</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-700">
              {tomReport.summary_sentences.map((s, i) => (
                <p key={i}>{s}</p>
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-lg bg-stone-900 p-5 text-stone-100">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-green-400">
              Recommended actions
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {tomVerdict.recommended_actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
          </section>

          <footer className="mt-8 border-t border-stone-200 pt-4 text-[10px] leading-relaxed text-stone-500">
            <p>
              Benchmarks sourced from {tomVerdict.why_panel.primary_finding.peer_paid_n}{" "}
              anonymized SE Missouri farms within{" "}
              {tomVerdict.why_panel.primary_finding.peer_paid_radius_miles} miles, and{" "}
              {tomVerdict.why_panel.primary_finding.mu_extension_citation}. Peer
              locations are jittered 1–2 miles per Showline privacy policy; individual
              farm identities are never shared.
            </p>
            <p className="mt-2">
              Showline has no commercial relationship with input suppliers, co-ops, or
              lenders. This report is provided to support borrower-lender conversations,
              not as a guarantee of input pricing.
            </p>
            <p className="mt-2 font-mono text-stone-400">
              showline.com/r/{tomReport.share_link_token}
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
