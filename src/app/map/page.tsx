"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { db, muellerFarm, tomQuote, formatUSD } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

type PeerQuote = {
  id: string;
  farm_id: string;
  line_items_per_acre?: {
    seed?: number;
    fertilizer?: number;
    crop_protection?: number;
    irrigation?: number;
    crop_insurance?: number;
  };
};

type PeerPaid = {
  id: string;
  farm_id: string;
  outcome: string;
  paid_per_acre?: {
    seed?: number;
    fertilizer?: number;
    crop_protection?: number;
    irrigation?: number;
    crop_insurance?: number;
  };
};

const COUNTY_GROUPS: Array<{ label: string; counties: string[]; sub?: string }> = [
  { label: "Scott County", counties: ["Scott"], sub: "Your county" },
  { label: "New Madrid", counties: ["New Madrid"] },
  { label: "Mississippi", counties: ["Mississippi"] },
  { label: "Stoddard", counties: ["Stoddard"] },
  { label: "Southern bootheel", counties: ["Pemiscot", "Dunklin", "Butler"], sub: "Pemiscot + Dunklin + Butler" },
];

const MIN_GROUP = 5;

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function minMax(values: number[]): [number, number] {
  return [Math.min(...values), Math.max(...values)];
}

const CATEGORY_LABEL: Record<string, string> = {
  seed: "Seed",
  fertilizer: "Fertilizer",
  crop_protection: "Crop protection",
  irrigation: "Irrigation",
  crop_insurance: "Crop insurance",
};

type CategoryKey = "seed" | "fertilizer" | "crop_protection" | "irrigation" | "crop_insurance";

const TOM_PRICES: Record<CategoryKey, number> = {
  seed: 125,
  fertilizer: 360,
  crop_protection: 98,
  irrigation: 45,
  crop_insurance: 30,
};

export default function PeerPricesPage() {
  const [category, setCategory] = useState<keyof typeof TOM_PRICES>("fertilizer");
  const [showContribute, setShowContribute] = useState(false);
  const [outcome, setOutcome] = useState<"signed_at_quoted" | "signed_different" | "did_not_sign" | null>(null);
  const [finalPrice, setFinalPrice] = useState("330");
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const groups = useMemo(() => {
    const farmsByCounty = new Map<string, string[]>();
    for (const f of db.farms) {
      if (!farmsByCounty.has(f.county)) farmsByCounty.set(f.county, []);
      farmsByCounty.get(f.county)!.push(f.id);
    }

    const quoteByFarm = new Map<string, PeerQuote["line_items_per_acre"]>();
    for (const q of db.quotes as PeerQuote[]) {
      if (q.line_items_per_acre) quoteByFarm.set(q.farm_id, q.line_items_per_acre);
    }
    const paidByFarm = new Map<string, PeerPaid["paid_per_acre"]>();
    for (const p of db.paid_prices as PeerPaid[]) {
      if (p.paid_per_acre) paidByFarm.set(p.farm_id, p.paid_per_acre);
    }

    return COUNTY_GROUPS.map((g) => {
      const farmIds = g.counties.flatMap((c) => farmsByCounty.get(c) ?? []);
      const peerIds = farmIds.filter((id) => id !== "farm_mueller");
      const quoted = peerIds
        .map((id) => quoteByFarm.get(id)?.[category])
        .filter((v): v is number => typeof v === "number" && v > 0);
      const paid = peerIds
        .map((id) => paidByFarm.get(id)?.[category])
        .filter((v): v is number => typeof v === "number" && v > 0);
      return {
        ...g,
        peerCount: peerIds.length,
        quotedMedian: quoted.length ? median(quoted) : null,
        paidMedian: paid.length ? median(paid) : null,
        paidRange: paid.length >= MIN_GROUP ? minMax(paid) : null,
        paidN: paid.length,
        includesTom: g.counties.includes(muellerFarm.county),
      };
    });
  }, [category]);

  const tomPrice = TOM_PRICES[category];

  function submitContribution() {
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 pb-24">
      <div className="mx-auto max-w-md">
        <header className="mb-4 flex items-center justify-between">
          <Wordmark subtle />
          <Link href="/verdict" className="text-sm text-stone-500 hover:text-stone-800">
            ← Verdict
          </Link>
        </header>

        <h2 className="font-serif text-2xl text-stone-900">What neighbors are paying</h2>
        <p className="mt-1 text-xs text-stone-600">
          Anonymized prices from {db.farms.length - 1} SE Missouri corn farms — grouped by
          county. Groups under {MIN_GROUP} farms are combined to protect identities.
        </p>

        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {Object.keys(TOM_PRICES).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat as keyof typeof TOM_PRICES)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                category === cat
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
              }`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        <section className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                  Your {CATEGORY_LABEL[category].toLowerCase()} quote
                </div>
                <div className="mt-0.5 font-mono text-2xl font-bold text-stone-900">
                  {formatUSD(tomPrice, { cents: true })}
                  <span className="ml-1 text-xs font-normal text-stone-500">/ac</span>
                </div>
              </div>
              {category === "fertilizer" && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-red-700">
                  78th percentile
                </span>
              )}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/60 text-[10px] font-semibold uppercase text-stone-500">
                <th className="px-3 py-2 text-left">Region</th>
                <th className="px-3 py-2 text-right">Farms</th>
                <th className="px-3 py-2 text-right">Quoted</th>
                <th className="px-3 py-2 text-right">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {groups.map((g) => {
                const tooSmall = g.peerCount < MIN_GROUP;
                const diffVsTom =
                  g.paidMedian !== null ? tomPrice - g.paidMedian : null;
                return (
                  <tr
                    key={g.label}
                    className={g.includesTom ? "bg-green-50/40" : ""}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900">{g.label}</span>
                        {g.includesTom && (
                          <span className="rounded bg-green-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                            You
                          </span>
                        )}
                      </div>
                      {g.sub && (
                        <div className="text-[10px] text-stone-500">{g.sub}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-stone-700">
                      {g.peerCount}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-stone-700">
                      {tooSmall
                        ? "—"
                        : g.quotedMedian !== null
                          ? formatUSD(g.quotedMedian, { cents: true })
                          : "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {tooSmall ? (
                        <span className="text-[10px] italic text-stone-400">
                          hidden &lt; {MIN_GROUP}
                        </span>
                      ) : g.paidMedian !== null ? (
                        <div>
                          <div className="font-mono font-semibold text-stone-900">
                            {formatUSD(g.paidMedian, { cents: true })}
                          </div>
                          {diffVsTom !== null && Math.abs(diffVsTom) >= 1 && (
                            <div
                              className={`text-[10px] ${
                                diffVsTom > 0 ? "text-red-700" : "text-green-700"
                              }`}
                            >
                              You {diffVsTom > 0 ? "+" : ""}
                              {formatUSD(diffVsTom, { cents: true })}
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-stone-200 bg-stone-50 px-3 py-2 text-[10px] text-stone-500">
            "Paid" = price that farms actually signed at, not the original quote. Within{" "}
            {db.peer_benchmarks_aggregated.radius_miles}-mile radius.
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="font-serif text-base text-stone-900">
            Scott County signings — {CATEGORY_LABEL[category].toLowerCase()}
          </h3>
          <p className="mt-1 text-[11px] text-stone-500">
            Five neighboring farms in your county recently signed corn contracts.
          </p>
          <ul className="mt-3 space-y-1.5">
            {db.paid_prices
              .filter((p) => {
                const farm = db.farms.find((f) => f.id === p.farm_id);
                return farm?.county === "Scott" && p.paid_per_acre;
              })
              .slice(0, 5)
              .map((p) => {
                const farm = db.farms.find((f) => f.id === p.farm_id)!;
                const price = (p.paid_per_acre as Record<string, number>)?.[category];
                const diff = price ? tomPrice - price : 0;
                return (
                  <li
                    key={p.id}
                    className="flex items-baseline justify-between text-sm"
                  >
                    <span className="text-stone-700">
                      Near {farm.nearest_town}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="font-mono text-stone-900">
                        {price ? formatUSD(price, { cents: true }) : "—"}
                      </span>
                      {price && Math.abs(diff) >= 1 && (
                        <span
                          className={`font-mono text-[10px] ${diff > 0 ? "text-red-700" : "text-green-700"}`}
                        >
                          {diff > 0 ? "+" : ""}
                          {formatUSD(diff, { cents: true })}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
          </ul>
          <p className="mt-3 text-[10px] text-stone-400">
            Farm names withheld per Showline privacy policy.
          </p>
        </section>

        {!showContribute && !submitted && (
          <section className="mt-6 rounded-xl border-2 border-green-700 bg-gradient-to-b from-green-50 to-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <h3 className="font-serif text-base text-stone-900">
                Help the next farmer
              </h3>
            </div>
            <p className="mt-2 text-sm leading-snug text-stone-700">
              Once you sign (or walk away), share your final prices anonymously so the
              next Tom in {muellerFarm.county} County sees an honest benchmark.
            </p>
            <button
              type="button"
              onClick={() => setShowContribute(true)}
              className="mt-4 block w-full rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-900"
            >
              Contribute my final quote
            </button>
            <ul className="mt-3 space-y-1 text-[10px] text-stone-600">
              <li>✓ Your name is never attached</li>
              <li>✓ GPS jittered 1–2 miles before sharing</li>
              <li>✓ Minimum group size of {MIN_GROUP} — you&apos;re never the only farm</li>
              <li>✓ Withdraw any time from Settings → Privacy</li>
            </ul>
          </section>
        )}

        {showContribute && !submitted && (
          <section className="mt-6 rounded-xl border-2 border-green-700 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base text-stone-900">
                Is this your final quote?
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowContribute(false);
                  setOutcome(null);
                }}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { key: "signed_at_quoted" as const, label: `Yes — signed at quoted ($${tomPrice}/ac)` },
                { key: "signed_different" as const, label: "Signed at a different price" },
                { key: "did_not_sign" as const, label: "Didn't sign — switching suppliers" },
              ].map((opt) => {
                const selected = outcome === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setOutcome(opt.key)}
                    className={`block w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-green-700 bg-green-50 text-green-900"
                        : "border-stone-200 bg-white text-stone-800 hover:border-stone-300"
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    {selected && opt.key === "signed_different" && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-mono text-stone-500">$</span>
                        <input
                          type="number"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-24 rounded border border-stone-300 px-2 py-1 font-mono text-sm focus:border-green-700 focus:outline-none"
                          min={150}
                          max={500}
                          step={1}
                        />
                        <span className="text-xs text-stone-500">/acre final</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <label className="mt-4 flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-green-700"
              />
              <span>
                Upload my final {CATEGORY_LABEL[category].toLowerCase()} price to the
                Showline benchmark, <strong>fully anonymized</strong>. No name, no exact
                location, never resold.
              </span>
            </label>

            <button
              type="button"
              disabled={!outcome || !consent}
              onClick={submitContribution}
              className="mt-4 block w-full rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-900 disabled:opacity-40"
            >
              Submit anonymously
            </button>
          </section>
        )}

        {submitted && (
          <section className="mt-6 rounded-xl border-2 border-green-600 bg-green-50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-sm text-white">
                ✓
              </span>
              <h3 className="font-serif text-base text-green-900">Thanks — uploaded.</h3>
            </div>
            <p className="mt-2 text-sm leading-snug text-green-900">
              Your{" "}
              {outcome === "signed_different"
                ? `final price of $${finalPrice}/ac`
                : outcome === "signed_at_quoted"
                  ? `signed-at-quoted outcome`
                  : `walk-away outcome`}{" "}
              is now part of the Scott County benchmark — {muellerFarm.county} County
              farmers will see an updated peer median within the hour.
            </p>
            <div className="mt-3 rounded-md bg-white p-3 text-[11px] text-stone-700 ring-1 ring-green-200">
              <div className="font-semibold text-stone-800">What was actually uploaded:</div>
              <ul className="mt-1 space-y-0.5 font-mono">
                <li>• category: {category}</li>
                <li>
                  • price: $
                  {outcome === "signed_different" ? finalPrice : tomPrice}/ac
                </li>
                <li>• county: {muellerFarm.county}</li>
                <li>• gps: 37.07,-89.55 <span className="text-stone-400">(jittered 1.4 mi)</span></li>
                <li>• farm_id: <span className="text-stone-400">[stripped]</span></li>
                <li>• name: <span className="text-stone-400">[stripped]</span></li>
              </ul>
            </div>
          </section>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/verdict"
            className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            ← Verdict
          </Link>
          <Link
            href="/scenario"
            className="rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-900"
          >
            Run scenarios →
          </Link>
        </div>

        <p className="mt-3 text-center text-[11px] text-stone-500">
          {db.ui_strings.map_legend_privacy}
        </p>
      </div>
    </main>
  );
}
