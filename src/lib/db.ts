import dbJson from "@/data/showline-db.json";

export const db = dbJson;
export type DB = typeof dbJson;

export const tom = db.users.find((u) => u.id === "usr_tom_mueller")!;
export const muellerFarm = db.farms.find((f) => f.id === "farm_mueller")!;
type TomQuote = {
  id: string;
  is_demo_quote: boolean;
  farm_id: string;
  user_id: string;
  supplier_id: string;
  supplier_display: string;
  crop: string;
  production_system: string;
  quote_date: string;
  uploaded_at: string;
  source: string;
  acres_covered: number;
  ocr_confidence: number;
  sarah_notes: string;
  line_items: Array<{
    category: string;
    description: string;
    price_per_acre: number;
    extracted_confidence: number;
    components?: Array<{ label: string; price_per_acre: number }>;
  }>;
  total_quoted_per_acre: number;
  total_quoted_full_operation: number;
};
export const tomQuote = db.quotes[0] as unknown as TomQuote;
export const tomVerdict = db.verdicts[0]!;
export const tomScenario = db.scenarios.demo_default;
export const tomReport = db.lender_reports[0]!;

export function formatUSD(n: number, opts: { cents?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(n);
}
