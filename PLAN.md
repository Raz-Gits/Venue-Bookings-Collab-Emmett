# BookOut · Plan of Record

*Decisions locked 2026-07-15 (Raz × Claude grill session). Rename or revisit anything by editing this file.*

## What it is

A nightlife booking marketplace: customers browse venues and request a table or full-venue buyout once, every matching venue's promoter gets texted, promoters reply with quotes, and the customer compares quotes and books with a deposit.

## Vision (direction of travel)

Start manual, get automatic. At launch, a promoter gets a **text plus an in-app request**, and quotes each one by hand inside the 1-hour window. Over time the goal is that venues **publish their live availability and exact pricing/hours directly** (on their own page/site), so a customer sees bookable inventory instantly instead of waiting on quotes. Quoting is the bootstrap; published live availability is the destination. The demo models the manual start.

## Decisions

| Decision | Answer |
|---|---|
| Working name | **BookOut** |
| Vertical | Nightlife: bottle-service tables + full-venue buyouts (clubs, lounges, bars) |
| Launch / demo market | **Orlando** (downtown: Wall Street Plaza, Church Street; I-Drive/Icon Park), prices in USD |
| Default booking type | **Venues** (full-venue) is the default tab; **Tables** second |
| Request model | Browse-first: matching venue cards shown immediately, all pre-selected; tap to add/remove, one request goes to the rest |
| Request fields | Area, date, start time, **guests (manual number, large groups OK)**, occasion, **budget (manual total, visible to promoters)** |
| Quote delivery | **Live arrival**: quotes appear as promoters reply, with a countdown to window close |
| Quote window | **1 hour** to answer |
| Promoter quoting | **Manual at first.** Promoter gets a **text + in-app request view** with an inline quote form (price, deposit, inclusions, note). Automation and published live availability come later |
| Deposit | **Promoter sets it in the quote**; counts toward the night's bill |
| Revenue | **~10% venue-side commission**, taken out of the deposit. Free for customers |
| First deploy | **Clickable demo on Netlify, simulated backend.** No real SMS/payments/DB. Quote window compressed to ~1 min; auto-simulated quotes plus a playable promoter view |
| House style | **No em dashes** in copy. Use middots (·), commas, or colons |

## Phases

1. **Demo (now):** static SPA on Netlify, everything simulated. Goal: feel both sides of the marketplace, show venues/partners.
2. **Real pipes:** database (e.g. Supabase), Twilio SMS to real promoters, in-app/magic-link quote forms hitting real storage. Payments still off.
3. **Money:** Stripe deposits, commission capture, refund/cancellation policy.
4. **Scale:** promoter app/dashboard, auto-quote rules, and venue-published live availability/hours. More cities.

## Open questions (not yet decided)

- Cancellation/refund policy for deposits (who keeps what, cutoff times)
- Venue verification: who counts as a legit promoter for a venue
- Customer identity: phone-verification only vs. accounts
- No-show handling and dispute flow
- Whether promoters see competing quotes (currently: no)
- When/how a venue graduates from quoting to publishing live availability

## People

- Raz · [@Raz-Gits](https://github.com/Raz-Gits)
- Emmett · [@emmettrosenblum-dot](https://github.com/emmettrosenblum-dot)
