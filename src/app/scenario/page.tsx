"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tomScenario, tomVerdict, formatUSD } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

const ACRES = tomScenario.acres;
const YIELD_BU_PER_AC = tomScenario.expected_yield_bu_per_acre;
const FIXED_COST_PER_AC = 822.30;
const NEG_SAVINGS_PER_AC = tomVerdict.estimated_overpayment_per_acre;

function margin(priceBu: number, yieldPct: number, costPerAc: number) {
  const yieldPerAc = YIELD_BU_PER_AC * (yieldPct / 100);
  return ACRES * (yieldPerAc * priceBu - costPerAc);
}

const PRICE_MIN = tomScenario.sliders.corn_price_per_bu.min;
const PRICE_MAX = tomScenario.sliders.corn_price_per_bu.max;
const PRICE_STEP = tomScenario.sliders.corn_price_per_bu.step;
const YIELD_MIN = tomScenario.sliders.yield_vs_expected_pct.min;
const YIELD_MAX = tomScenario.sliders.yield_vs_expected_pct.max;

export default function ScenarioPage() {
  const [price, setPrice] = useState(tomScenario.sliders.corn_price_per_bu.default);
  const [yieldPct, setYieldPct] = useState(
    tomScenario.sliders.yield_vs_expected_pct.default,
  );

  const quotedMargin = margin(price, yieldPct, FIXED_COST_PER_AC);
  const negotiatedMargin = margin(price, yieldPct, FIXED_COST_PER_AC - NEG_SAVINGS_PER_AC);

  const breakeven = useMemo(() => {
    const yieldPerAc = YIELD_BU_PER_AC * (yieldPct / 100);
    return FIXED_COST_PER_AC / yieldPerAc;
  }, [yieldPct]);

  const chartData = useMemo(() => {
    const points: { price: number; quoted: number; negotiated: number }[] = [];
    for (let p = PRICE_MIN; p <= PRICE_MAX + 1e-6; p += 0.1) {
      points.push({
        price: Number(p.toFixed(2)),
        quoted: margin(p, yieldPct, FIXED_COST_PER_AC),
        negotiated: margin(p, yieldPct, FIXED_COST_PER_AC - NEG_SAVINGS_PER_AC),
      });
    }
    return points;
  }, [yieldPct]);

  const chartH = 160;
  const chartW = 320;
  const yMin = -150000;
  const yMax = 200000;
  const yToPx = (y: number) =>
    chartH - ((y - yMin) / (yMax - yMin)) * chartH;
  const xToPx = (p: number) =>
    ((p - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * chartW;

  const quotedPath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xToPx(d.price).toFixed(1)} ${yToPx(d.quoted).toFixed(1)}`)
    .join(" ");
  const negotiatedPath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xToPx(d.price).toFixed(1)} ${yToPx(d.negotiated).toFixed(1)}`)
    .join(" ");

  const marginColor = quotedMargin >= 0 ? "text-green-700" : "text-red-700";
  const status =
    quotedMargin >= 50000
      ? { label: "Healthy margin", tint: "bg-green-50 text-green-800 border-green-200" }
      : quotedMargin >= 0
        ? { label: "Tight but positive", tint: "bg-amber-50 text-amber-900 border-amber-200" }
        : { label: "Below breakeven", tint: "bg-red-50 text-red-900 border-red-200" };

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 pb-24">
      <div className="mx-auto max-w-md">
        <header className="mb-4 flex items-center justify-between">
          <Wordmark subtle />
          <Link href="/verdict" className="text-sm text-stone-500 hover:text-stone-800">
            ← Verdict
          </Link>
        </header>

        <h2 className="font-serif text-2xl text-stone-900">What-if scenarios</h2>
        <p className="mt-1 text-xs text-stone-600">
          Slide corn price and yield to see your projected season margin on {ACRES} corn acres.
        </p>

        <section className="mt-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                Projected margin (quoted cost)
              </div>
              <div className={`mt-1 font-mono text-3xl font-bold ${marginColor}`}>
                {quotedMargin >= 0 ? "+" : ""}
                {formatUSD(Math.round(quotedMargin))}
              </div>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${status.tint}`}
            >
              {status.label}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between rounded-md bg-green-50 px-3 py-2 ring-1 ring-green-200">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                If you negotiate fertilizer
              </div>
              <div className="mt-0.5 text-xs text-green-800">
                +{formatUSD(negotiatedMargin - quotedMargin)} added margin
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-green-800">
              {negotiatedMargin >= 0 ? "+" : ""}
              {formatUSD(Math.round(negotiatedMargin))}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-stone-500">
            Breakeven corn price at this yield: {formatUSD(breakeven, { cents: true })}/bu
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">Margin vs. corn price</span>
            <span className="text-stone-500">Yield {yieldPct}% of expected</span>
          </div>
          <svg
            viewBox={`0 0 ${chartW + 50} ${chartH + 30}`}
            className="block h-auto w-full"
          >
            <g transform="translate(40, 8)">
              <line x1={0} x2={chartW} y1={yToPx(0)} y2={yToPx(0)} stroke="#d6d3cc" strokeWidth="1" />
              <line x1={0} x2={chartW} y1={chartH} y2={chartH} stroke="#d6d3cc" strokeWidth="1" />
              <line x1={0} x2={0} y1={0} y2={chartH} stroke="#d6d3cc" strokeWidth="1" />

              <text x={-6} y={yToPx(0) + 3} fontSize="9" textAnchor="end" fill="#78716c">
                $0
              </text>
              <text x={-6} y={yToPx(100000) + 3} fontSize="9" textAnchor="end" fill="#78716c">
                +$100k
              </text>
              <text x={-6} y={yToPx(-100000) + 3} fontSize="9" textAnchor="end" fill="#78716c">
                –$100k
              </text>

              <text x={0} y={chartH + 14} fontSize="9" fill="#78716c">
                ${PRICE_MIN.toFixed(2)}
              </text>
              <text x={chartW} y={chartH + 14} fontSize="9" textAnchor="end" fill="#78716c">
                ${PRICE_MAX.toFixed(2)}
              </text>

              <path d={negotiatedPath} fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 3" />
              <path d={quotedPath} fill="none" stroke="#1c1917" strokeWidth="2" />

              <circle
                cx={xToPx(price)}
                cy={yToPx(quotedMargin)}
                r={5}
                fill="#1c1917"
                stroke="white"
                strokeWidth="2"
              />
              <circle
                cx={xToPx(price)}
                cy={yToPx(negotiatedMargin)}
                r={5}
                fill="#16a34a"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          </svg>
          <div className="mt-2 flex justify-end gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-stone-700">
              <span className="inline-block h-0.5 w-4 bg-stone-900" />
              Quoted cost
            </span>
            <span className="flex items-center gap-1.5 text-green-700">
              <span
                className="inline-block h-0.5 w-4"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #16a34a 0, #16a34a 4px, transparent 4px, transparent 7px)",
                }}
              />
              If negotiated
            </span>
          </div>
        </section>

        <section className="mt-5 space-y-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="price" className="text-sm font-medium text-stone-800">
                Corn price
              </label>
              <span className="font-mono text-base font-semibold text-stone-900">
                {formatUSD(price, { cents: true })}/bu
              </span>
            </div>
            <input
              id="price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-2 w-full accent-green-700"
            />
            <div className="mt-1 flex justify-between text-[10px] text-stone-500">
              <span>${PRICE_MIN.toFixed(2)}</span>
              <span>Front-month CBOT ZC ≈ $4.42</span>
              <span>${PRICE_MAX.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="yield" className="text-sm font-medium text-stone-800">
                Yield vs. expected
              </label>
              <span className="font-mono text-base font-semibold text-stone-900">
                {yieldPct}% · {Math.round(YIELD_BU_PER_AC * yieldPct / 100)} bu/ac
              </span>
            </div>
            <input
              id="yield"
              type="range"
              min={YIELD_MIN}
              max={YIELD_MAX}
              step={1}
              value={yieldPct}
              onChange={(e) => setYieldPct(Number(e.target.value))}
              className="mt-2 w-full accent-green-700"
            />
            <div className="mt-1 flex justify-between text-[10px] text-stone-500">
              <span>{YIELD_MIN}%</span>
              <span>5-yr avg = 100%</span>
              <span>{YIELD_MAX}%</span>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-xl bg-green-900 p-4 text-green-50 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-green-300">
            Connection to verdict
          </div>
          <p className="mt-2 text-sm leading-snug">{tomScenario.messages.connection_to_verdict}</p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/map"
            className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            ← Peer map
          </Link>
          <Link
            href="/forecast"
            className="rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-900"
          >
            See price forecast →
          </Link>
        </div>
      </div>
    </main>
  );
}
