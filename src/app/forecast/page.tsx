import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { fetchCornFutures, buildForecastBand } from "@/lib/forecast";
import { formatUSD, tomScenario, tomVerdict } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACRES = tomScenario.acres;
const YIELD_BU = tomScenario.expected_yield_bu_per_acre;
const FIXED_COST = 822.30;
const NEG_SAVINGS = tomVerdict.estimated_overpayment_per_acre;

const BREAKEVEN_QUOTED = FIXED_COST / YIELD_BU;
const BREAKEVEN_NEGOTIATED = (FIXED_COST - NEG_SAVINGS) / YIELD_BU;

const W = 360;
const H = 200;

export default async function ForecastPage() {
  const data = await fetchCornFutures();
  const band = buildForecastBand(data.series, 7);

  const allPrices = [
    ...data.series.map((s) => s.close),
    ...band.map((b) => b.high),
    ...band.map((b) => b.low),
    BREAKEVEN_QUOTED,
    BREAKEVEN_NEGOTIATED,
  ];
  const yMin = Math.min(...allPrices) - 0.2;
  const yMax = Math.max(...allPrices) + 0.2;

  const firstDate = new Date(data.series[0].date + "T00:00:00Z").getTime();
  const lastBandDate = band.length
    ? new Date(band[band.length - 1].date + "T00:00:00Z").getTime()
    : new Date(data.series[data.series.length - 1].date + "T00:00:00Z").getTime();
  const todayDate = new Date(
    data.series[data.series.length - 1].date + "T00:00:00Z",
  ).getTime();

  const xAt = (iso: string) => {
    const t = new Date(iso + "T00:00:00Z").getTime();
    return ((t - firstDate) / (lastBandDate - firstDate)) * W;
  };
  const yAt = (price: number) => H - ((price - yMin) / (yMax - yMin)) * H;
  const todayX = ((todayDate - firstDate) / (lastBandDate - firstDate)) * W;

  const histPath = data.series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.date).toFixed(1)} ${yAt(p.close).toFixed(1)}`)
    .join(" ");

  const midPath = band.length
    ? `M ${xAt(data.series[data.series.length - 1].date).toFixed(1)} ${yAt(data.series[data.series.length - 1].close).toFixed(1)} ` +
      band
        .map((b) => `L ${xAt(b.date).toFixed(1)} ${yAt(b.mid).toFixed(1)}`)
        .join(" ")
    : "";

  const bandArea = band.length
    ? (() => {
        const tail = data.series[data.series.length - 1];
        const tx = xAt(tail.date);
        const ty = yAt(tail.close);
        const top = band
          .map((b) => `L ${xAt(b.date).toFixed(1)} ${yAt(b.high).toFixed(1)}`)
          .join(" ");
        const bot = [...band]
          .reverse()
          .map((b) => `L ${xAt(b.date).toFixed(1)} ${yAt(b.low).toFixed(1)}`)
          .join(" ");
        return `M ${tx} ${ty} ${top} ${bot} Z`;
      })()
    : "";

  const dec2026 = band.find((b) => b.date.startsWith("2026-12")) ?? band[band.length - 1];
  const currentPrice = data.current_price_dollars_per_bu;
  const decMid = dec2026?.mid ?? currentPrice;

  const harvestRevenueQuoted = ACRES * YIELD_BU * decMid;
  const harvestMarginQuoted = harvestRevenueQuoted - ACRES * FIXED_COST;
  const harvestMarginNegotiated =
    harvestRevenueQuoted - ACRES * (FIXED_COST - NEG_SAVINGS);

  const verdictTint =
    decMid > BREAKEVEN_QUOTED * 1.05
      ? { color: "green", label: "Profitable at forecast", note: "Forecast clears your breakeven by 5%+." }
      : decMid > BREAKEVEN_QUOTED
        ? { color: "amber", label: "Tight margin", note: "Forecast hovers just above breakeven — negotiate to widen the cushion." }
        : { color: "red", label: "Below breakeven", note: "Forecast does not cover quoted costs. Negotiating fertilizer is critical." };

  const TINT: Record<string, string> = {
    green: "border-green-300 bg-green-50 text-green-900",
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    red: "border-red-300 bg-red-50 text-red-900",
  };

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 pb-24">
      <div className="mx-auto max-w-md">
        <header className="mb-4 flex items-center justify-between">
          <Wordmark subtle />
          <Link href="/scenario" className="text-sm text-stone-500 hover:text-stone-800">
            ← Scenarios
          </Link>
        </header>

        <h2 className="font-serif text-2xl text-stone-900">Corn price forecast</h2>
        <p className="mt-1 text-xs text-stone-600">
          Front-month CBOT corn futures (ZC=F) over the past 6 months, with a 7-month
          forward projection through harvest.
        </p>

        <div className="mt-3 flex items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-[11px]">
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${data.source === "live" ? "bg-green-500" : "bg-amber-500"}`}
            />
            <span className="text-stone-700">
              {data.source === "live" ? "Live · Yahoo Finance" : "Offline snapshot"}
            </span>
          </span>
          <span className="font-mono text-stone-500">
            {new Date(data.fetched_at).toISOString().slice(0, 16).replace("T", " ")}Z
          </span>
        </div>

        <section className="mt-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                Current ({data.symbol})
              </div>
              <div className="mt-1 font-mono text-3xl font-bold text-stone-900">
                {formatUSD(currentPrice, { cents: true })}
                <span className="ml-1 text-base font-normal text-stone-500">/bu</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-stone-600">
              <div>52w high {formatUSD(data.fifty_two_week_high, { cents: true })}</div>
              <div>52w low {formatUSD(data.fifty_two_week_low, { cents: true })}</div>
            </div>
          </div>

          <svg viewBox={`0 0 ${W + 20} ${H + 30}`} className="mt-3 block h-auto w-full">
            <g transform="translate(10, 8)">
              <line
                x1={0}
                x2={W}
                y1={yAt(BREAKEVEN_QUOTED)}
                y2={yAt(BREAKEVEN_QUOTED)}
                stroke="#dc2626"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={W - 4}
                y={yAt(BREAKEVEN_QUOTED) - 3}
                fontSize="9"
                fill="#dc2626"
                textAnchor="end"
              >
                Breakeven (quoted) ${BREAKEVEN_QUOTED.toFixed(2)}
              </text>

              <line
                x1={0}
                x2={W}
                y1={yAt(BREAKEVEN_NEGOTIATED)}
                y2={yAt(BREAKEVEN_NEGOTIATED)}
                stroke="#16a34a"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={W - 4}
                y={yAt(BREAKEVEN_NEGOTIATED) - 3}
                fontSize="9"
                fill="#16a34a"
                textAnchor="end"
              >
                Breakeven (negotiated) ${BREAKEVEN_NEGOTIATED.toFixed(2)}
              </text>

              {bandArea && (
                <path d={bandArea} fill="#facc15" fillOpacity="0.18" stroke="none" />
              )}

              <path d={histPath} fill="none" stroke="#1c1917" strokeWidth="1.75" />
              {midPath && (
                <path
                  d={midPath}
                  fill="none"
                  stroke="#ca8a04"
                  strokeWidth="1.75"
                  strokeDasharray="5 3"
                />
              )}

              <line
                x1={todayX}
                x2={todayX}
                y1={0}
                y2={H}
                stroke="#78716c"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <text x={todayX + 3} y={10} fontSize="9" fill="#78716c">
                Today
              </text>

              <circle
                cx={todayX}
                cy={yAt(currentPrice)}
                r={4}
                fill="#1c1917"
                stroke="white"
                strokeWidth="1.5"
              />

              {dec2026 && (
                <>
                  <circle
                    cx={xAt(dec2026.date)}
                    cy={yAt(dec2026.mid)}
                    r={4}
                    fill="#ca8a04"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <text
                    x={xAt(dec2026.date) - 4}
                    y={yAt(dec2026.mid) - 8}
                    fontSize="9"
                    fontWeight="600"
                    fill="#854d0e"
                    textAnchor="end"
                  >
                    Dec ${dec2026.mid.toFixed(2)}
                  </text>
                </>
              )}

              <text x={0} y={H + 14} fontSize="9" fill="#78716c">
                {data.series[0].date.slice(0, 7)}
              </text>
              <text x={W} y={H + 14} fontSize="9" fill="#78716c" textAnchor="end">
                {band[band.length - 1]?.date.slice(0, 7) ?? ""}
              </text>
            </g>
          </svg>

          <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px]">
            <span className="flex items-center gap-1.5 text-stone-700">
              <span className="inline-block h-0.5 w-4 bg-stone-900" /> Historical
            </span>
            <span className="flex items-center gap-1.5 text-yellow-700">
              <span
                className="inline-block h-0.5 w-4"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #ca8a04 0, #ca8a04 4px, transparent 4px, transparent 7px)",
                }}
              />
              Forecast mid
            </span>
            <span className="flex items-center gap-1.5 text-yellow-700">
              <span className="inline-block h-2 w-3 rounded-sm bg-yellow-300/40" /> 1σ band
            </span>
          </div>
        </section>

        <section
          className={`mt-5 rounded-xl border-2 p-4 shadow-sm ${TINT[verdictTint.color]}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest">
            {verdictTint.label}
          </div>
          <p className="mt-1 text-sm leading-snug">{verdictTint.note}</p>
        </section>

        <section className="mt-5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="font-serif text-base text-stone-900">
            If you sell {ACRES} acres at the Dec forecast
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-stone-200 p-3">
              <div className="text-[10px] font-semibold uppercase text-stone-500">
                Quoted cost
              </div>
              <div
                className={`mt-1 font-mono text-lg font-bold ${harvestMarginQuoted >= 0 ? "text-stone-900" : "text-red-700"}`}
              >
                {harvestMarginQuoted >= 0 ? "+" : ""}
                {formatUSD(Math.round(harvestMarginQuoted))}
              </div>
              <div className="text-[10px] text-stone-500">
                @ {formatUSD(decMid, { cents: true })}/bu × {YIELD_BU} bu
              </div>
            </div>
            <div className="rounded-md border border-green-300 bg-green-50 p-3">
              <div className="text-[10px] font-semibold uppercase text-green-700">
                If negotiated
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-green-800">
                +{formatUSD(Math.round(harvestMarginNegotiated))}
              </div>
              <div className="text-[10px] text-green-700">
                +{formatUSD(harvestMarginNegotiated - harvestMarginQuoted)} margin lift
              </div>
            </div>
          </div>
        </section>

        <p className="mt-5 text-[10px] leading-relaxed text-stone-500">
          Forecast is a directional projection from recent price trend, not a guarantee.
          For binding price commitments consult your grain marketer. Independent of input
          suppliers, co-ops, and lenders.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/scenario"
            className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            ← Scenarios
          </Link>
          <Link
            href="/verdict"
            className="rounded-lg bg-green-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-900"
          >
            Back to verdict
          </Link>
        </div>
      </div>
    </main>
  );
}
