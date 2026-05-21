import fallback from "@/data/forecast-fallback.json";

export type PricePoint = { date: string; close: number };

export type CornForecast = {
  source: "live" | "fallback";
  fetched_at: string;
  symbol: string;
  display_name: string;
  current_price_dollars_per_bu: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  series: PricePoint[];
};

const YAHOO_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/ZC=F?interval=1d&range=6mo";

export async function fetchCornFutures(): Promise<CornForecast> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(YAHOO_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Showline 2026 demo) independent benchmarks for SE Missouri farmers",
      },
      next: { revalidate: 900 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);
    const data = await res.json();
    const r = data?.chart?.result?.[0];
    if (!r) throw new Error("Unexpected Yahoo payload shape");

    const ts: number[] = r.timestamp ?? [];
    const closesCents: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
    const series: PricePoint[] = [];
    for (let i = 0; i < ts.length; i++) {
      const c = closesCents[i];
      if (c == null) continue;
      series.push({
        date: new Date(ts[i] * 1000).toISOString().slice(0, 10),
        close: Number((c / 100).toFixed(4)),
      });
    }
    if (series.length < 30) throw new Error("Series too short");

    return {
      source: "live",
      fetched_at: new Date().toISOString(),
      symbol: r.meta?.symbol ?? "ZC=F",
      display_name: r.meta?.shortName ?? "Corn Futures",
      current_price_dollars_per_bu:
        Number(r.meta?.regularMarketPrice) / 100 || series[series.length - 1].close,
      fifty_two_week_high: Number(r.meta?.fiftyTwoWeekHigh) / 100,
      fifty_two_week_low: Number(r.meta?.fiftyTwoWeekLow) / 100,
      series,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[forecast] Yahoo fetch failed, using fallback:", (err as Error).message);
    return {
      source: "fallback",
      fetched_at: fallback.fetched_at,
      symbol: fallback.symbol,
      display_name: fallback.display_name,
      current_price_dollars_per_bu: fallback.current_price_dollars_per_bu,
      fifty_two_week_high: fallback.fifty_two_week_high,
      fifty_two_week_low: fallback.fifty_two_week_low,
      series: fallback.series,
    };
  }
}

export type ForecastBand = {
  date: string;
  low: number;
  mid: number;
  high: number;
};

export function buildForecastBand(
  series: PricePoint[],
  monthsAhead = 7,
): ForecastBand[] {
  const last = series[series.length - 1];
  if (!last) return [];

  const window = series.slice(-30);
  const trendStart = window[0]?.close ?? last.close;
  const trendEnd = last.close;
  const monthlyDrift = ((trendEnd - trendStart) / 30) * 21;

  const baseDate = new Date(last.date + "T00:00:00Z");
  const out: ForecastBand[] = [];
  for (let m = 1; m <= monthsAhead; m++) {
    const d = new Date(baseDate);
    d.setUTCMonth(d.getUTCMonth() + m);
    const mid = last.close + monthlyDrift * m * 0.6;
    const spread = 0.06 * last.close * Math.sqrt(m);
    out.push({
      date: d.toISOString().slice(0, 10),
      mid: Number(mid.toFixed(3)),
      low: Number((mid - spread).toFixed(3)),
      high: Number((mid + spread).toFixed(3)),
    });
  }
  return out;
}
