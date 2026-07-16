# BookOut · Plan of Record

*Decisions locked 2026-07-15 (Raz × Claude grill session). Rename or revisit anything by editing this file.*

## What it is

A nightlife booking marketplace: customers browse venues and request a table or full-venue buyout once, every matching venue's promoter gets texted, promoters reply with quotes, and the customer compares quotes and books with a deposit.

## Vision (direction of travel)

Start manual, get automatic. At launch, a promoter gets a **text plus an in-app request**, and quotes each one by hand inside the 1-hour window. Over time the goal is that venues **publish their live availability and exact pricing/hours directly** (on their own page/site), so a customer sees bookable inventory instantly instead of waiting on quotes. Quoting is the bootstrap; published live availability is the destination. The demo models the manual start.

## Decisions

> **⚠️ Model change proposed by Emmett (2026-07-15), pending Raz review in PR.**
> The customer flow is moving from the multi-venue quote blast to an **Airbnb-style browse → venue page → instant book** flow. This overrides the "Request model", "Quote delivery", and "Promoter quoting" rows below and reorders the vision: it jumps straight to the "published live availability, book instantly" destination for the customer side. The quoting engine and playable promoter view still exist in the code but are **dormant** (not on the main path). Raz: please confirm or push back before this merges. The rows below are marked accordingly.

| Decision | Answer |
|---|---|
| Working name | **BookOut** |
| Vertical | Nightlife: bottle-service tables + full-venue buyouts (clubs, lounges, bars) |
| Launch / demo market | **Orlando** (downtown: Wall Street Plaza, Church Street; I-Drive/Icon Park), prices in USD |
| Default booking type | **Venues** (full-venue) is the default tab; **Tables** second |
| Request model | **CHANGED → Airbnb-style.** Browse venue cards, open a venue for photos, details, amenities, and its open nights, then **book a single night instantly with a deposit**. Heart to save favorites. (Was: multi-venue quote blast, all pre-selected, one request to the rest.) |
| Venue page | Opening a card shows a hero, a photo gallery, blurb, capacity/hours/neighborhood facts, an included-amenities list, and a per-night deal calendar. Picking a night sets the instant price |
| Request fields | Area, **date range**, start time, **guests (manual number, large groups OK)**, occasion, **budget (manual total, optional)** |
| Date shopping | **When is a date range, not one date.** A deal calendar shows every night with a demand level (Quiet · Busy · Peak) and a relative price delta. **Midweek is cheaper than Fri/Sat, and an early-bird discount (up to 18%, ~0.6%/day out) rewards booking far ahead.** Cheapest night is pre-picked; the guest books one night |
| Quote delivery | **DORMANT (was live-arrival quote board).** Instant book replaces the quote wait on the main path. Board code retained pending Raz review |
| Promoter quoting | **DORMANT (was manual text + in-app quote form).** Retained in code, not on the customer path pending Raz review |
| Deposit | **20% of the night's total**, credited toward the bill |
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
