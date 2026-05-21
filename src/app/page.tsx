import Link from "next/link";
import { tom, muellerFarm, db } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

export default function Home() {
  const ui = db.ui_strings;

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col">
        <header className="mb-10 flex items-start justify-between">
          <Wordmark />
          <span className="mt-2 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-stone-600">
            No commercial ties
          </span>
        </header>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-lg text-stone-900">
            {ui.welcome_greeting.replace("Tom", "")}
            <span className="font-semibold">{tom.display_name.split(" ")[0]}</span>.
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {muellerFarm.internal_name} — {muellerFarm.total_acres.toLocaleString()}{" "}
            acres in {muellerFarm.county} County, {muellerFarm.state}.
          </p>

          <div className="mt-6 rounded-md border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
            {ui.empty_state}
          </div>
        </section>

        <Link
          href="/followup"
          className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-base">
            💬
          </span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-amber-900">
              Sarah has a follow-up
            </div>
            <div className="text-[11px] text-amber-800/80">
              About your March MFA fertilizer quote — 2 minutes
            </div>
          </div>
          <span className="text-amber-700">→</span>
        </Link>

        <div className="mt-8 space-y-3">
          <Link
            href="/upload"
            className="block w-full rounded-lg bg-green-800 px-4 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:bg-green-900 active:bg-green-950"
          >
            {ui.primary_cta}
          </Link>
          <button
            type="button"
            className="block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            {ui.secondary_cta}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          {ui.privacy_pill}
        </p>

        <div className="mt-auto pt-10 text-center text-[10px] text-stone-400">
          Benchmarks from MU Extension g658 · g659 · g651 · 2026 budgets
        </div>
      </div>
    </main>
  );
}
