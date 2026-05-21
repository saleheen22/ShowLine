"use client";

import { useEffect, useState } from "react";
import { db, tomQuote, tomVerdict, tomReport, muellerFarm, tom } from "./db";

const STORAGE_KEY = "showline_active_scenario_id";

export type ScenarioId = "mfa" | "bootheel";

export type Scenario = {
  id: ScenarioId;
  supplier_display: string;
  supplier_short: string;
  farmer_name: string;
  farm_internal_name: string;
  county: string;
  state: string;
  total_acres: number;
  quote: typeof tomQuote;
  verdict: typeof tomVerdict;
  report: typeof tomReport;
};

const mfaScenario: Scenario = {
  id: "mfa",
  supplier_display: tomQuote.supplier_display,
  supplier_short: "MFA",
  farmer_name: tom.display_name,
  farm_internal_name: muellerFarm.internal_name,
  county: muellerFarm.county,
  state: muellerFarm.state,
  total_acres: muellerFarm.total_acres,
  quote: tomQuote,
  verdict: tomVerdict,
  report: tomReport,
};

// Holcomb's Bootheel quote is at peer median for fertilizer ($328 vs $305 paid median),
// so the verdict is NEGOTIABLE-light rather than the headline NEGOTIABLE of Tom's case.
const bootheelScenario: Scenario = {
  id: "bootheel",
  supplier_display: "Bootheel Agronomy LLC, Charleston branch",
  supplier_short: "Bootheel",
  farmer_name: "Vance Holcomb",
  farm_internal_name: "Holcomb River Farms",
  county: "Mississippi",
  state: "MO",
  total_acres: 1180,
  quote: {
    ...tomQuote,
    id: "quote_holcomb_bootheel_2026_03",
    farm_id: "farm_holcomb",
    user_id: "usr_vance_holcomb",
    supplier_id: "sup_bootheel_charleston",
    supplier_display: "Bootheel Agronomy LLC, Charleston branch",
    quote_date: "2026-03-09",
    uploaded_at: "2026-03-09T16:42:00-05:00",
    source: "photo",
    acres_covered: 850,
    ocr_confidence: 0.93,
    sarah_notes:
      "Detected supplier: Bootheel Agronomy LLC, Charleston branch. Quote date: March 9, 2026. Acres: 850 (corn furrow-irrigated). All line items extracted with high confidence.",
    line_items: [
      {
        category: "seed",
        description: "Pioneer P1847AM, 32K population",
        price_per_acre: 128.0,
        extracted_confidence: 0.96,
      },
      {
        category: "fertilizer",
        description: "Fertilizer total (N + P + K)",
        price_per_acre: 328.0,
        extracted_confidence: 0.95,
        components: [
          { label: "Nitrogen (urea + UAN, 240 units)", price_per_acre: 200.0 },
          { label: "Phosphorus (DAP, 80 lb)", price_per_acre: 73.0 },
          { label: "Potassium (potash, 60 lb)", price_per_acre: 55.0 },
        ],
      },
      {
        category: "crop_protection",
        description: "Resicore XL + post + Veltyma fungicide",
        price_per_acre: 94.0,
        extracted_confidence: 0.91,
      },
      {
        category: "irrigation",
        description: "Lay-flat poly, diesel allowance, punch & set",
        price_per_acre: 48.0,
        extracted_confidence: 0.92,
      },
      {
        category: "crop_insurance",
        description: "Crop insurance (80% RP)",
        price_per_acre: 32.0,
        extracted_confidence: 0.95,
      },
    ],
    total_quoted_per_acre: 630.0,
    total_quoted_full_operation: 535500,
  },
  verdict: {
    ...tomVerdict,
    id: "verdict_holcomb_bootheel_2026_03",
    quote_id: "quote_holcomb_bootheel_2026_03",
    farm_id: "farm_holcomb",
    computed_at: "2026-03-09T16:45:00-05:00",
    verdict: "NEGOTIABLE",
    color: "amber",
    headline: "Fertilizer is close — small ask before signing.",
    estimated_overpayment_dollars: 19550,
    estimated_overpayment_acres: 850,
    estimated_overpayment_per_acre: 23.0,
    narrative_summary:
      "Your seed, crop protection, irrigation, and insurance prices are right in line with what neighboring Mississippi County farms are paying. The fertilizer line is slightly above the regional peer median — your quote sits at $328/acre versus a peer paid median of $305/acre. That's roughly a $19,550 gap across 850 acres. Holcomb-area farms have been getting urea + UAN re-quoted at this week's prices and seeing $15-25/ac come off. Worth asking your Bootheel rep whether the urea + UAN line can be re-quoted at this week's prices.",
    why_panel: {
      primary_finding: {
        category: "fertilizer",
        your_per_acre: 328.0,
        peer_paid_median_per_acre: 305.0,
        peer_paid_n: 28,
        peer_paid_radius_miles: 60,
        mu_extension_per_acre: 303.15,
        mu_extension_citation: "MU Extension g658, SE MO Corn Planning Budget 2026",
        gap_per_acre: 23.0,
        gap_full_operation: 19550,
        status_color: "amber",
      },
      in_range: [
        {
          category: "seed",
          label: "Seed",
          your_per_acre: 128.0,
          percentile: 64,
          commentary: "Slightly above median, in line with peers",
          status_color: "green",
        },
        {
          category: "crop_protection",
          label: "Crop protection",
          your_per_acre: 94.0,
          percentile: 38,
          commentary: "Below median — well-priced",
          status_color: "green",
        },
        {
          category: "irrigation",
          label: "Irrigation",
          your_per_acre: 48.0,
          percentile: 76,
          commentary: "$5/ac above median — diesel allowance is the driver",
          status_color: "green",
        },
      ],
      amber_items: [
        {
          category: "crop_insurance",
          label: "Crop insurance",
          your_per_acre: 32.0,
          percentile: 85,
          commentary: "80% RP coverage runs higher than the 75% most peers carry",
          status_color: "amber",
        },
      ],
    },
    verdict_tiles: [
      { label: "YOUR FERTILIZER", value: "$328/acre", subline: "62nd percentile", tint: "amber" },
      { label: "PEER MEDIAN", value: "$305/acre", subline: "28 farms, 60 mi", tint: "neutral" },
      { label: "MU EXTENSION 2026", value: "$303.15/acre", subline: "SE MO Corn Budget", tint: "neutral" },
    ],
    recommended_actions: [
      "Ask Bootheel to re-quote the urea + UAN line at this week's prices.",
      "Get a parallel quote from MFA Charleston — two peers within 12 miles signed there at $298–$306/acre.",
      "If the rep won't move on fertilizer, accept it — the gap is small and your other lines are well-priced.",
    ],
  },
  report: {
    ...tomReport,
    id: "report_holcomb_bootheel_2026_03",
    verdict_id: "verdict_holcomb_bootheel_2026_03",
    farm_id: "farm_holcomb",
    title: "Input cost analysis — Holcomb River Farms, 2026 corn",
    subtitle: "Independent third-party benchmark for lender review",
    verdict_line: "NEGOTIABLE — $19,550 estimated fertilizer overpayment",
    summary_sentences: [
      "Vance Holcomb's 2026 corn input quote from Bootheel Agronomy LLC totals $535,500 across 850 furrow-irrigated acres ($630/acre).",
      "Four of five categories (seed, crop protection, irrigation, insurance) price within ~$5/acre of the SE Missouri peer median.",
      "Fertilizer is the only material gap: $328/acre quoted vs. $305/acre peer paid median, a $23/acre or $19,550 operation-wide spread.",
      "Showline recommends a re-quote on the urea + UAN line at current week pricing before signing.",
    ],
  },
};

export const scenariosById: Record<ScenarioId, Scenario> = {
  mfa: mfaScenario,
  bootheel: bootheelScenario,
};

export function detectScenarioFromFilename(filename: string): ScenarioId {
  const f = filename.toLowerCase();
  if (f.includes("bootheel") || f.includes("holcomb")) return "bootheel";
  return "mfa";
}

export function setActiveScenario(id: ScenarioId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function clearActiveScenario() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function readActiveScenarioId(): ScenarioId {
  if (typeof window === "undefined") return "mfa";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "bootheel" ? "bootheel" : "mfa";
}

export function useActiveScenario(): Scenario {
  const [id, setId] = useState<ScenarioId>("mfa");
  useEffect(() => {
    setId(readActiveScenarioId());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setId(readActiveScenarioId());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return scenariosById[id];
}

// Suppress unused export warning for db (kept import for potential future use)
export { db };
