# BookOut — Plan of Record

*Decisions locked 2026-07-15 (Raz × Claude grill session). Rename/revisit anything by editing this file.*

## What it is

A nightlife booking marketplace: customers request a table or full-venue buyout once, every matching venue's promoter gets texted, promoters reply with quotes, and the customer compares quotes and books with a deposit.

## Decisions

| Decision | Answer |
|---|---|
| Working name | **BookOut** |
| Vertical | Nightlife — bottle-service tables + full-venue buyouts (clubs, lounges, bars) |
| Launch / demo market | **Orlando** (downtown — Wall Street Plaza, Church Street; I-Drive/Icon Park), prices in USD |
| Request model | Search shows matching venue cards, **all pre-selected**; customer can deselect, one tap requests quotes from the rest |
| Request fields | Area, date, start time, party size, occasion, table vs. buyout, **optional budget range (visible to promoters)** |
| Quote delivery | **Live arrival** — quotes appear as promoters reply, with a countdown to window close |
| Quote window | **1 hour** to answer |
| Promoter quoting | **Manual at first**: SMS contains a **magic link** to a no-login mini quote form (price, min spend, inclusions, deposit required, note). Auto-quoting + promoter app are later phases |
| Deposit | **Promoter sets it in the quote**; counts toward the night's bill |
| Revenue | **~10% venue-side commission**, taken out of the deposit. Free for customers |
| First deploy | **Clickable demo on Netlify, simulated backend** — no real SMS/payments/DB. Quote window compressed to ~1 min; auto-simulated quotes **plus a playable promoter-phone view** (the real magic-link form) |

## Phases

1. **Demo (now):** static SPA on Netlify, everything simulated. Goal: feel both sides of the marketplace, show venues/partners.
2. **Real pipes:** database (e.g. Supabase), Twilio SMS to real promoters, magic-link quote forms hitting real storage. Payments still off.
3. **Money:** Stripe deposits, commission capture, refund/cancellation policy.
4. **Scale:** promoter app/dashboard, auto-quote rules, more cities.

## Open questions (not yet decided)

- Cancellation/refund policy for deposits (who keeps what, cutoff times)
- Venue verification — who counts as a legit promoter for a venue
- Customer identity: phone-verification only vs. accounts
- No-show handling and dispute flow
- Whether promoters see competing quotes (currently: no)

## People

- Raz — [@Raz-Gits](https://github.com/Raz-Gits)
- Emmett — *(GitHub invite pending — need username/email)*
