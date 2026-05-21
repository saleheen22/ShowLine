"use client";

import Link from "next/link";
import { useState } from "react";
import { db, tom, tomQuote, formatUSD } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

const fu = db.post_contract_followups[0];

type OptionKey = "signed_at_quoted" | "signed_different" | "did_not_sign";

export default function FollowupPage() {
  const [choice, setChoice] = useState<OptionKey | null>(null);
  const [finalPrice, setFinalPrice] = useState<string>("330");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    const finalNum = Number(finalPrice);
    const savings =
      choice === "signed_different" && Number.isFinite(finalNum)
        ? (360 - finalNum) * tomQuote.acres_covered
        : choice === "did_not_sign"
          ? 33000
          : 0;

    return (
      <main className="min-h-screen bg-stone-50 px-6 py-8 pb-24">
        <div className="mx-auto max-w-md">
          <header className="mb-6 flex items-center justify-between">
            <Wordmark subtle />
            <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
              Home
            </Link>
          </header>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-700 font-serif text-base font-semibold text-white">
              S
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-sm bg-white p-4 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200">
              {choice === "signed_at_quoted" && (
                <>Got it — thanks for closing the loop. I&apos;ll note the season went through at the quoted price.</>
              )}
              {choice === "signed_different" && (
                <>
                  Nice work pushing back. {savings > 0 ? `You saved roughly ${formatUSD(savings)} versus the original quote.` : ""}
                </>
              )}
              {choice === "did_not_sign" && (
                <>Smart move. I&apos;ll track the alternate supplier&apos;s pricing for next season.</>
              )}
            </div>
          </div>

          <section className="mt-6 rounded-xl border-2 border-green-300 bg-gradient-to-b from-green-50 to-white p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-green-700">
              Response recorded
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase text-stone-500">
                  Outcome
                </div>
                <div className="mt-1 text-sm font-medium text-stone-900">
                  {choice === "signed_at_quoted" && "Signed at quoted"}
                  {choice === "signed_different" && "Signed at lower price"}
                  {choice === "did_not_sign" && "Switched supplier"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase text-stone-500">
                  Estimated impact
                </div>
                <div
                  className={`mt-1 font-mono text-lg font-bold ${savings > 0 ? "text-green-700" : "text-stone-500"}`}
                >
                  {savings > 0 ? `+${formatUSD(savings)}` : "—"}
                </div>
              </div>
            </div>
            {choice !== "signed_at_quoted" && savings > 0 && (
              <div className="mt-3 rounded-md bg-green-100 px-3 py-2 text-xs text-green-800">
                That&apos;s your real-world delta against the original quote — useful when
                you talk to your lender.
              </div>
            )}
          </section>

          <section className="mt-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="font-serif text-base text-stone-900">
              How your answer is used
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs text-stone-600">
              <li className="flex gap-2">
                <span className="text-green-700">✓</span>
                <span>
                  Your final price is added to the anonymized SE Missouri benchmark — only
                  the dollar amount, never your name or farm.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-700">✓</span>
                <span>
                  Helps neighboring farms see the difference between quoted and paid
                  prices in real time.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-700">✓</span>
                <span>
                  You can withdraw this contribution any time from{" "}
                  <span className="font-medium text-stone-700">Settings → Privacy</span>.
                </span>
              </li>
            </ul>
          </section>

          <Link
            href="/"
            className="mt-6 block w-full rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-900"
          >
            Done
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 pb-24">
      <div className="mx-auto max-w-md">
        <header className="mb-4 flex items-center justify-between">
          <Wordmark subtle />
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
            Skip for now
          </Link>
        </header>

        <div className="rounded-md bg-stone-100 px-3 py-2 text-[10px] uppercase tracking-wide text-stone-600">
          📱 Push notification ·{" "}
          {new Date(fu.sent_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
        <div className="mt-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm">
          {db.ui_strings.followup_push}
        </div>

        <div className="mt-6 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-700 font-serif text-base font-semibold text-white">
            S
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm bg-white p-4 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200">
            Hey {tom.display_name.split(" ")[0]}, quick one: {fu.question_text}
            <div className="mt-1 text-[11px] text-stone-500">
              Helps me sharpen the benchmark for everybody around you.
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {fu.options.map((o) => {
            const selected = choice === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setChoice(o.key as OptionKey)}
                className={`block w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-green-700 bg-green-50 text-green-900"
                    : "border-stone-200 bg-white text-stone-800 hover:border-stone-300"
                }`}
              >
                <div className="font-medium">{o.label}</div>
                {selected && o.key === "signed_different" && (
                  <div className="mt-3">
                    <label className="text-[10px] font-semibold uppercase text-stone-500">
                      Final fertilizer $/acre
                    </label>
                    <div className="mt-1 flex items-center gap-2">
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
                      <span className="text-xs text-stone-500">per acre</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!choice}
          onClick={() => setSubmitted(true)}
          className="mt-6 block w-full rounded-lg bg-green-800 px-4 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-green-900 disabled:opacity-40"
        >
          Submit answer
        </button>

        <p className="mt-3 text-center text-[11px] text-stone-500">
          {db.privacy_policy.principles[0]}
        </p>
      </div>
    </main>
  );
}
