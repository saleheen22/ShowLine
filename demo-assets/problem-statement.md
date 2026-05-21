SHOWLINE — App Walkthrough
A product design document. No tech stack. No code. Just what the app looks like, how it feels to use, what data flows where, and why every verdict comes with its evidence.

What Showline is
Showline is a phone-first app that tells a farmer whether their co-op quote is a fair price — in plain English, with proof.
The farmer takes a photo (or uploads a PDF) of the quote their MFA, CHS, or local co-op sent them. Showline reads it, compares the prices against (a) what neighboring farms actually paid for the same inputs and (b) what the University of Missouri Extension's published 2026 planning budget says fair cost should be. Then it shows three things, in this order:

A verdict — FAIR, NEGOTIABLE, or OVERPRICED — with the dollar impact across the farmer's whole operation.
Why — the specific line items driving the verdict, each backed by a benchmark.
A map — anonymized neighboring farms shown by what they paid, so the farmer can see their position in the regional market.

The whole interaction takes 90 seconds. The output is something the farmer can show their lender, their spouse, and their co-op rep when they push back on price.

Who uses it
Tom Mueller — 47, runs 1,200 acres in Scott County, Missouri (600 corn / 600 soybean in rotation). He has a smartphone. He is rarely at a desk. He uses Showline:

In his pickup truck after stopping by the co-op
At the kitchen table after dinner with a paper quote in front of him
Standing in a field during a phone call with his lender
On the porch while waiting for his wife to finish a call

The app must work with one thumb, in landscape and portrait, on a 5-year-old Android phone in spotty rural cellular coverage.

How the data flows — two streams, both anonymous
Showline runs on two distinct data streams. Understanding the difference matters because it's the foundation of the whole product.
Stream 1 — Benchmark data (the academic reference)
This comes from University of Missouri Extension and other land-grant university extension services. It's published yearly as PDF documents — public, peer-reviewed, free to use. It tells the app what costs should be given current input market prices, based on academic economic modeling.
For Tom's region in 2026, this is the MU Extension Southeast Missouri Corn Planning Budget (g658) — it says fertilizer should be around $303/acre, seed around $119/acre, and so on.
The farmer doesn't contribute anything to this stream. It's a fixed reference layer that updates once a year when MU publishes a new edition.
Stream 2 — Peer data (what farmers actually pay)
This is the heart of Showline's moat. It comes from other farmers using the app — completely anonymized. It tells the app what farms like Tom's are actually paying right now in the local market.
Peer data has two contribution moments:
Moment 1 — Pre-contract (the quote upload)
When a farmer uploads their co-op quote to get a verdict, the quoted prices flow into a current market intelligence layer. This is what's being offered in the region right now. It's not yet a paid price — the farmer might renegotiate or walk away — but it tells the system what suppliers are quoting this month.
This is what lets Showline say things like "Three farms within 15 miles of you are seeing fertilizer quotes around $295/acre this week."
Moment 2 — Post-contract (what was actually paid)
After the farmer signs (or decides not to sign), Showline sends a lightweight follow-up — one screen, one question:

"Did you sign your March fertilizer quote? What was the final per-acre price?"

The farmer taps one of three buttons: Signed at quoted price / Signed at a different price / Didn't sign — went elsewhere. If different, they enter the final number. That's it.
These confirmed paid prices become the trustworthy peer median — the gold-standard reference that future farmers see when they upload their own quotes. Quoted prices show you the market's mood; paid prices show you what farms actually live with.
Privacy — the non-negotiables
Both streams are anonymized at the moment of contribution. The farmer never enters their name, and the app never shows it to anyone else. Specifically:

Farm names are never displayed on any map, in any benchmark, in any other user's view. Even within Showline's own internal data, only an opaque ID exists.
GPS coordinates are jittered by 1–2 miles before any peer sees them. A neighboring farmer looking at the map sees a pin in the general area, never the exact field.
No individual farm is ever shown — only aggregate stats ("3 farms within 15 miles paid a median of $295/acre"). A peer must always be part of a group of at least 5 to appear in any benchmark.
The farmer can opt out of contributing to the peer dataset at any time, in settings, with one toggle. Their own analyses still work — they just stop adding to the shared pool.
No data is sold to or shared with input suppliers, co-ops, or lenders under any circumstance. This is in the terms of service and surfaced in the UI repeatedly.

The privacy promise appears explicitly on the welcome screen, every upload screen, and as a tappable badge on every screen of the app. It's not buried in legalese.

The screens (in order of use)
Each screen below describes what the user sees on a phone. Where the experience differs on a tablet or desktop, that's called out separately. The app is mobile-first; the desktop version is the same content with more breathing room and side-by-side panels where space allows.

Screen 1 — Welcome
A clean, quiet screen on a warm off-white background. The Showline wordmark sits near the top — set in a slightly stylish serif, with a thin green line beneath it (the visual echo of the "baseline" idea).
Beneath the wordmark, the tagline: "Independent cost benchmarks for Show-Me State farmers."
A small pill near the top corner says "No commercial ties to input suppliers." Tapping it opens a brief plain-English explanation of how Showline is funded (farmer subscriptions + extension partnerships) and what it explicitly refuses to do (accept money from suppliers, share data with lenders, push specific products).
In the middle of the screen, a welcome card greets Tom by name:

Welcome back, Tom.
Mueller Family Farms — 1,200 acres in Scott County, MO.

Beneath the greeting, an empty-state line: "You haven't analyzed a 2026 quote yet. Upload your co-op quote and Sarah will tell you whether it's a fair price."
A single large primary button: Upload a quote. Below it, a smaller text link: "Talk to Sarah instead" (the fallback for farmers who don't have a digital quote — they can type the numbers conversationally).
On mobile, this is a vertical stack with the button comfortably above the thumb's resting position. On desktop, everything centers in a 640px-wide card.

Screen 2 — Upload
A simple drop zone on desktop, a camera-first interface on mobile.
On a phone, the screen presents two large buttons stacked vertically:

Take a photo — opens the device camera so the farmer can photograph the paper quote on their kitchen table
Upload a file — opens the file picker for PDFs already in email or photos already in the camera roll

A small line below: "Most farmers upload directly from their MFA or co-op email. Photos of paper quotes work too."
When a file is selected, the screen transitions into a preview state: a thumbnail of the quote appears, and a sweeping green line animates across it (the visual cue that Sarah is "reading"). A short message under the preview: "Reading your quote… this takes about 5 seconds."
This is also where the privacy reminder reappears, briefly: "Your quote is analyzed for you and used only in anonymized form to help other farmers. It is never shared with any supplier or lender."

Screen 3 — Sarah's confirmation
Once Sarah has read the quote, the screen becomes a chat-style interface. Sarah's avatar is a small green circle with the initial "S." Her bubble greets Tom:

"I read your quote. Here's what I pulled out — make sure I got it right before I run the analysis."

Beneath her message, a clean card lists every cost line item Sarah found:

✓ Seed (DeKalb DKC68-69, 32K population): $125.00 / acre
✓ Fertilizer total: $360.00 / acre
— Nitrogen (urea + UAN, 240 units): $220.00
— Phosphorus (DAP, 80 lb): $80.00
— Potassium (potash, 60 lb): $60.00
✓ Crop protection (pre-emerge + post-emerge + fungicide): $98.00 / acre
✓ Irrigation supplies & power: $45.00 / acre
✓ Crop insurance (75% RP): $30.00 / acre
Detected supplier: MFA Incorporated, Sikeston branch
Quote date: March 12, 2026
Acres on the quote: 600 (corn program)

Two buttons below the card:

Looks right — analyze it (primary, green)
I need to fix something (secondary — opens an inline edit mode where the farmer can tap any number to correct it)

If anything was ambiguous in the source PDF, Sarah flags it inline: "I wasn't sure if the $42 line is a pre-emerge or just glyphosate — can you confirm?"
This screen exists for one reason: trust. The farmer must see what Sarah read before she renders a verdict, or they won't believe the verdict.

Screen 4 — The Verdict (the most important screen in the app)
This is where the product earns its existence. The screen leads with one word and one number.
At the top, taking up roughly the top third of the phone screen, is the verdict card. For Tom, it looks like this:

⚠️ NEGOTIABLE
Push back on fertilizer before signing.
Estimated overpayment: $33,000 across your 600 corn acres.

The verdict word is huge — 48px on mobile, 64px on desktop — set in the verdict's color (green for FAIR, amber for NEGOTIABLE, clay red for OVERPRICED). The dollar number underneath is the single most consequential piece of information on the screen, because that's the number a farmer remembers when they call their co-op rep.
The verdict has three possible states, with consistent visual language:
VerdictWhen it appearsColorSuggested action✅ FAIRAll categories within ~5% of both benchmarksGreen"You're priced in line with the regional market. Sign with confidence."⚠️ NEGOTIABLE1–2 line items meaningfully over benchmarks, or $5K–$15K total gapAmber"Push back on specific items before signing. Potential savings: $X."🛑 OVERPRICED3+ line items high, or >$15K total gapClay red"Don't sign as written. Renegotiate before committing."
The "Why" panel — always shown, never hidden
Directly below the verdict, a panel headed Why this verdict lays out the reasoning. This is non-negotiable — a verdict without its evidence is a black box, and farmers (correctly) don't trust black boxes. The "Why" panel always shows:

The biggest gap is fertilizer.
Your quote: $360/acre.
Regional peer median: $305/acre (28 farms within 60 miles).
MU Extension 2026 budget: $303.15/acre.
You're $55/acre above the regional market — that's $33,000 across your 600 corn acres.
Two other categories are within range:
– Seed: $125/acre (52nd percentile, in line with peers)
– Crop protection: $98/acre (41st percentile, below median — well-priced)

Each line item in the breakdown is its own small visual card with three bits of information: Tom's quoted price, the peer median, and the MU Extension reference. A small status dot — green, amber, or red — sits beside each.
Below the "Why" panel, two buttons:

See the map (primary — scrolls down to the next section, or opens a fullscreen map on mobile)
Run a downside scenario (secondary — jumps to the scenario screen)

A tertiary action sits at the bottom: Sarah's full analysis — taps to expand a longer, narrative explanation in plain language. This is the AI-generated commentary that explains why the gap might exist (timing? supplier? volume?) and what to investigate. The farmer can read it or skip it — the verdict and the why are the load-bearing elements; the narrative is enrichment.

Screen 5 — The Map (the visual proof)
If the verdict is the headline and the "Why" panel is the byline, the map is the photograph. It exists to make the regional pricing pattern visible — to turn "you're paying more than peers" from a claim into an undeniable image.
On mobile, the map opens fullscreen when the farmer taps See the map from the verdict screen. There's a slim header strip at the top showing Tom's farm and county. A row of pill-shaped toggles lets the farmer switch the map's color coding by category:

[ Fertilizer ] [ Seed ] [ Crop protection ] [ Total inputs ]

Fertilizer is selected by default because that's where Tom's biggest gap is.
The map itself is light-themed (so the colored pins pop) and centered on Tom's region. Tom's farm is a larger, slowly pulsing red dot near the center, with an always-visible label: "Mueller Family Farms — You."
Around Tom, 28 anonymized peer farms appear as colored circular pins. Each pin is sized and colored according to what that farm paid for the currently selected category:

🟢 Green — below the peer median (paying less than half the farms in the region)
🟡 Amber — between the median and 75th percentile
🔴 Red — above the 75th percentile (paying more than three-quarters of similar farms)

The visual story leaps out: Tom is a red dot surrounded by mostly green and amber pins. The neighbors right next to him are paying less than he is for the same input. This is the moment that lands.
Tapping any pin opens a small popup with anonymized information:

Anonymized farm
Approximately 12 miles from you
Fertilizer: $295/acre — 32nd percentile
Operation size: 950 acres
Soil type: similar (Sharkey clay)

No farm name. No exact address. Just enough to make the comparison meaningful.
A small map legend sits in the bottom corner. It shows the color scale and one critical line of text: "Peer locations jittered by 1–2 miles for privacy. Comparing 28 farms within 60 miles, similar soil and scale." That sentence is the privacy promise made visible — the farmer can see Showline is protecting their neighbors the same way it protects them.
Below the map (or accessible by scrolling down on mobile), a three-tile benchmark summary sits beneath the map for at-a-glance numbers:

[ YOUR FERTILIZER ] [ PEER MEDIAN ] [ MU EXTENSION 2026 ]
[ $360/acre ]      [ $305/acre ]   [ $303.15/acre ]
[ 78th percentile ] [ 28 farms, 60mi ] [ SE MO Corn Budget ]

Tom's tile has a faint red tint, matching the verdict. The other two are neutral white cards.
Mobile-specific map behavior

The map fully supports pinch-to-zoom and two-finger pan
Tapping a pin opens the popup; tapping again or anywhere outside dismisses it
A floating "back to verdict" button stays pinned to the bottom-right corner so the farmer can return to the headline at any time
If cellular coverage is weak, the map uses cached tiles and shows a small banner: "Offline tiles — last updated yesterday."


Screen 6 — Scenario (the downside)
Once Tom understands his quote position, he wants to know what happens if the market turns against him. This screen lets him model two variables that drive his year:

What if commodity prices drop?
[Slider: Corn price at harvest — default $4.40 — drag down to $3.00]
What if yield comes in below expectation?
[Slider: Yield vs expected — default 100% — drag down to 70%]

Below the sliders, in large type:

Projected margin (600 corn acres)
$87,420

As Tom drags either slider, the margin number updates live and smoothly animates between colors:

Green when margin > $50K
Amber when margin is positive but under $50K
Clay red when margin goes negative

When the number turns red, a discreet alert appears below: "At these levels, you cannot cover operating costs. Consider revisiting input commitments before signing."
The connection back to the verdict is explicit. A line of text under the sliders says: "This projection uses your quoted costs. If you can negotiate fertilizer down to the regional median, you'd add $33,000 to your margin at every scenario."
That one sentence turns the verdict from a complaint into a decision. The farmer doesn't have to do the math.

Screen 7 — Share with my lender
Tom taps a button at the bottom of the scenario screen: Generate lender report. A clean modal slides up showing a printable, single-page summary:

SHOWLINE COST ANALYSIS
Mueller Family Farms — March 2026
Verdict: NEGOTIABLE — estimated $33,000 overpayment across 600 corn acres
Quoted cost structure (table of every line item)
Benchmark comparison (a small version of the chart — Tom vs peer median vs MU Extension)
Downside scenario (margin at $3.80 corn and 90% yield: -$28,400)
Sarah's summary: two sentences distilling the analysis
Generated by Showline. Independent of all input suppliers and lenders. Backed by University of Missouri Extension 2026 planning budgets.

Two buttons at the bottom of the modal:

Send to lender by email (opens the device's mail app with the report attached as a PDF)
Copy link (puts a private, secure share link on the clipboard for sending by text, WhatsApp, or whatever the lender prefers)

The link works for 30 days and never reveals the farmer's full data — only the report. The lender doesn't need a Showline account to view it.

Screen 8 — Post-contract follow-up (the data flywheel)
Two weeks after Tom uploads a quote, he gets a single push notification:

Showline: Quick question about that MFA fertilizer quote — did you end up signing?

Tapping it opens a screen with one question and three large buttons:

Did you sign the MFA quote?
✅ Yes — at the quoted price ($360/acre)
✏️ Yes — at a different price (tap to enter the final number)
❌ No — I went somewhere else (optional: tap to record where and why)

The entire interaction is meant to take under 15 seconds. If Tom doesn't respond, the notification appears once more a week later, then never again — no harassment.
This is where the gold-standard peer data is born. If 50 SE Missouri farmers all confirm what they actually paid for fertilizer this season — not what they were quoted, but what they paid — those numbers become the median that every future user sees. Quoted prices show market mood; paid prices show market reality. Both matter, but paid prices are what farmers truly compare against.
A line below the buttons reminds Tom of the privacy commitment: "Your final price is added to the regional benchmark in fully anonymized form. Your name and exact location are never shared." Below that, a small link: "Don't add my data to the peer benchmark" — a one-tap opt-out, available always.

The verdict explained, end to end
Every verdict Showline issues follows the same logic, and the logic is shown to the user. There is no hidden scoring model and no proprietary "trust us" algorithm. The reasoning is on the screen.
Step 1: Showline compares each cost category in the farmer's quote against two benchmarks.

Peer median — the middle price among the 28 nearest similar farms (within 60 miles, similar soil, similar acreage)
MU Extension 2026 reference — the academic estimate of fair cost from that year's published planning budget

Step 2: Each category gets a percentile rank.

Below the peer median → 🟢 well-priced
Between the median and the 75th percentile → 🟡 average to slightly high
Above the 75th percentile → 🔴 expensive

Step 3: The verdict is determined by counting flagged categories and summing the total dollar gap.

FAIR: zero flagged categories, total gap under $5K → Sign with confidence.
NEGOTIABLE: 1–2 flagged categories OR $5K–$15K total gap → Push back on specific items.
OVERPRICED: 3+ flagged categories OR more than $15K total gap → Renegotiate before signing.

Step 4: The "Why" panel always shows the reasoning — which categories are flagged, by how much, what the benchmarks said, and what the dollar impact is across the farmer's full operation.
This transparency is part of the product's promise. Farmers have been burned by tools that show them a score without showing them how it was calculated. Showline does the opposite: the math is in plain sight, the comparison farms are visible on the map, the academic reference is cited by publication number. If a farmer wants to verify, they can open the MU Extension PDF themselves.

Mobile-first details that matter
Beyond responsive layout, several decisions are made specifically for the way farmers actually use phones:

Buttons are at least 48×48px and positioned in the lower thumb zone, not the top of the screen
Camera capture is the first upload option on mobile, not a hidden alternative — most farmers have paper quotes more often than PDF emails
Maps support pinch-zoom and two-finger pan with smooth performance; pin tap zones are larger than the visible pin itself
All text is at least 16px at base, with adjustable size for older users
High-contrast palette survives bright outdoor sunlight (color choices stay legible in direct sun)
Critical actions never require a second hand — no two-finger gestures for primary flows
Offline-tolerant reads — once an analysis has been generated, the verdict, map, and report viewing all work without cellular signal. Only the initial upload requires connectivity.
Lightweight animations — no heavy transitions that drain battery or stutter on older phones


The privacy promise, in plain English
The product depends on farmers trusting that their data is safe and that the data they see from others is real. Both parts of that trust are earned, not assumed. Here is what Showline commits to, in language that appears in the app itself (not buried in legalese):

Your name never appears on any other farmer's screen. When you contribute a price to the peer dataset, it's stripped of all identifying information immediately on upload.
Your farm's exact location is never shared. Showline jitters every farm's coordinates by 1 to 2 miles before any other user sees them. The pin on the map is your neighborhood, not your driveway.
You're never the only farm in a benchmark. Showline only displays peer comparisons when at least five farms in the relevant group have contributed. If you're alone in a category, you'll see the MU Extension reference but no peer benchmark — by design.
You can opt out of peer contribution at any time. One toggle in settings. Your own analyses still work; you just stop adding to the shared pool. You can opt back in whenever you want.
Showline never sells, shares, or licenses your data to input suppliers, co-ops, or lenders. Period. This is in the terms of service and surfaced in the app every time you upload.
You can delete your data at any time. A single action in settings removes everything you've ever contributed — including anonymized prices already aggregated into the peer dataset. (Aggregates from before the deletion remain, since they're no longer attributable.)

These six commitments appear together, plainly worded, on a screen titled Your Data, Your Choice, accessible from the welcome screen footer and from settings. They are repeated in shortened form on every upload screen.

Summary: the loop in one paragraph
A farmer takes a photo of their co-op quote. Sarah reads it in five seconds and confirms what she pulled out. Showline compares every cost line against the regional peer median and the MU Extension 2026 reference budget, then delivers a verdict — FAIR, NEGOTIABLE, or OVERPRICED — with the dollar impact across the farmer's full operation and the specific line items that drove the verdict. A map shows neighboring farms color-coded by what they paid, so the farmer can see their position in the market. A scenario screen lets them model what happens if commodity prices drop. A one-tap report goes to their lender. Two weeks later, a single notification asks what they actually paid — that answer becomes the peer median for the next farmer who uploads a quote. Their name never appears. Their location is jittered. They can opt out anytime. That's the whole product.