# Showline

Tells Missouri farmers whether their co-op input quote is fair by comparing line items against (a) anonymized peer farm data and (b) MU Extension planning budgets.

Built for the Vibeathon. Demo persona: Tom Mueller, 1,200 acres in Scott County, MO. Demo verdict: **NEGOTIABLE** — $33,000 fertilizer overpayment vs. peer median.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 5, strict mode
- Tailwind CSS 4
- Live corn-futures fetch from Yahoo Finance (`ZC=F`), with offline fallback

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Demo flow

1. `/` — Welcome screen with Sarah's follow-up prompt
2. `/upload` — Real OS file picker (try `demo-assets/MFA-Quote-Mueller-2026-03-12.pdf` or `demo-assets/Bootheel-Quote-Holcomb-2026-03-09.jpg`)
3. `/confirm` — OCR review of extracted line items
4. `/verdict` — Headline verdict with overpayment breakdown
5. `/map` — Peer prices by SE Missouri county + anonymous contribution flow
6. `/scenario` — Live margin sliders against corn-price + yield assumptions
7. `/forecast` — Live `ZC=F` futures chart with 7-month forecast band
8. `/report` — Print-friendly lender report
9. `/followup` — Post-season "what did you actually sign at?" survey

## Privacy primitives

- Minimum group size of 5 farms per benchmark slice
- GPS jittered 1–2 miles before any peer share
- Farm names and IDs stripped from uploaded benchmarks
- Withdraw any contribution from Settings → Privacy

## Data

- `src/data/showline-db.json` — All seeded users, farms, quotes, paid prices, verdicts, scenarios, lender reports, peer benchmarks, MU Extension budgets, UI strings, privacy policy
- `src/data/forecast-fallback.json` — 124 daily corn-futures points captured from Yahoo (fallback when the live fetch fails)
- `demo-assets/` — Sample supplier quotes (Mueller MFA PDF + Holcomb Bootheel JPG) and the HTML sources used to render them

Benchmarks reference MU Extension corn/soybean planning budgets (g658, g659, g651).
