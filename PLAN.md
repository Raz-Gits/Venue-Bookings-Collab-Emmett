# BookOut · Plan of Record

*Decisions locked 2026-07-15 (Raz × Claude grill session). Rename or revisit anything by editing this file.*

## What it is

A nightlife booking marketplace: customers browse venues and request a table or full-venue buyout once, every matching venue's promoter gets texted, promoters reply with quotes, and the customer compares quotes and books with a deposit.

## Vision (direction of travel)

Start manual, get automatic. At launch, a promoter gets a **text plus an in-app request**, and quotes each one by hand inside the 1-hour window. Over time the goal is that venues **publish their live availability and exact pricing/hours directly** (on their own page/site), so a customer sees bookable inventory instantly instead of waiting on quotes. Quoting is the bootstrap; published live availability is the destination. The demo models the manual start.

## Update 2026-07-15 (booking model)

Default customer flow is now **book-and-approve**, not the quote auction:
browse → venue page → pick a package + a night → **Request to book** → the
venue **approves in the promoter dashboard** → confirmed. Venues list **set
prices/packages** (tables + full-venue buyouts). The **compare-quotes** auction
is kept as an optional mode via a toggle on the browse screen (not deleted).

Folded in from **Emmett's PR #2**: **dynamic date pricing** (weekday demand,
Quiet/Busy/Peak, early-bird discount up to 18% the further out you book), a
shared month calendar for picking the night, a browse "deal nights" strip, and
a richer venue page (gallery, facts, amenities). Emmett's PR used *instant*
book; we kept our **venue-approval** step on top of their pricing.

## Update 2026-07-19 (look + group features)

The browse screen now uses the **Airbnb-style home layout** trialed in
`preview-airbnb.html`: a Where / When / Who search pill (When opens the ported
React Aria range calendar), slim detail chips, and photo-first carousels for
buyouts and tables (venues with real photos lead). Compare-quotes mode keeps
the multi-select grid. New features, all simulated in the demo:

- **Add tables to a buyout**: per-night priced table add-ons, each with its
  own deposit rate, flowing through request → approval → dashboard.
- **Split the deposit (organizer-guarantee model)**: never all-or-nothing.
  The organizer's card guarantees the full deposit, friends chip in by share
  link, and whatever's unpaid at the cutoff stays on the organizer (shares
  credited back). Real version is Stripe, Phase 3.
- **LED table sign**: optional field on the booking request that flows to the
  promoter's request card. Included with VIP booth and buyouts; +$50 add-on
  on other tables, billed at the venue. "AI ideas" are canned templates in
  the demo; production swaps in a small Claude call.
- **Temp real photos** on three venues (see launch blocker in long-lead items).

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

## What the demo simulates today (the gap list)

Honest inventory of what is fake. Everything visual is real and reusable; everything behind it is not.

1. **No database.** Venues, packages, and bookings live in a JS object in the browser. Refresh wipes everything.
2. **Customer and venue are the same browser tab.** The "approval" works because you play both sides. Two devices can't see the same booking.
3. **No real SMS.** The promoter text is a roleplay panel, not Twilio.
4. **No payments.** The deposit is a number on screen. No card, no capture, no commission.
5. **No identity.** No customer verification, no promoter login (the login screen is a skip button), no roles or permissions.
6. **Venue data is fiction.** 9 made-up Orlando venues, gradient placeholder photos, invented prices. No real venue has agreed to anything.
7. **Pricing is client-side and cosmetic.** A real venue can't set or change prices, and a client-computed price can never be what we actually charge (trivially tampered with).
8. **No inventory.** Infinite tables per night; two people can book the same booth for the same night.
9. **No lifecycle.** No approval expiry, no cancellation, no refunds, no no-show handling.
10. **No legal.** No ToS, privacy policy, SMS consent (TCPA/A2P), or venue commission agreement.
11. **No ops.** No admin panel, no monitoring, no support path, no staging environment.

## Roadmap to production

Frontend stays the vanilla SPA on Netlify; it grows a small `api.js` and talks to real services. Proposed stack, chosen for lowest ops burden for a two-person team: **Supabase** (Postgres + auth + realtime + edge functions), **Twilio** (SMS), **Stripe** (payments). No servers to run.

### Phase 1 · Demo (done)

Static SPA, everything simulated. Goal was to feel both sides of the marketplace and have something to show venues. Shipped.

### Phase 2 · Pilot-ready: one real booking, no money

Goal: a real venue on their own phone approves a real customer's request end to end. Deposit still handled off-app (venue collects as they do today).

- Supabase schema: `venues`, `packages`, `bookings`, `customers`, `promoters`, with row-level security so a promoter sees only their venue's requests.
- Replace hardcoded `VENUES` with a DB fetch; keep the demo data as seed rows.
- Booking requests persist with real status transitions: requested → approved / declined / expired.
- **Server-side pricing**: the demand/early-bird engine moves into an edge function; the client displays prices but the server computes the one that counts at booking time.
- Customer phone verification (SMS OTP) to submit a request. No accounts yet.
- Sign field persists with the booking; AI sign suggestions become a small server-side Claude call.
- Promoter magic-link auth into the dashboard (decision already locked: magic link first).
- Twilio SMS to the promoter on new request, with the magic link. **Start A2P 10DLC registration immediately, it takes weeks and blocks all US SMS.**
- Realtime status updates via Supabase subscriptions (replaces the demo's polling).
- Approval expiry: edge function cron auto-expires stale requests and texts the customer.
- Inventory guard: each package has a per-night count; booking decrements it, prevents double-booking.
- Minimal admin view (can be the Supabase dashboard at first).

### Phase 3 · Money

Goal: the deposit actually moves, commission is actually taken.

- Stripe: card collected at request time (SetupIntent), **charged only on venue approval**. No approval, no charge.
- Stripe Connect for venue payouts: deposit in, ~10% commission held back, rest to the venue.
- Split deposits for real (organizer-guarantee): organizer's card is the guarantee, share-link chip-ins via Stripe, auto-settle the unpaid remainder on the organizer at the cutoff. Never blocks the booking.
- Cancellation/refund policy implemented (blocking decision below).
- Receipts and confirmation emails/SMS to both sides.
- ToS + privacy policy + venue commission agreement (template lawyer pass).

### Phase 4 · Launch Orlando

Goal: strangers can use it without either of us in the loop.

- Onboard 3 to 5 real venues: real photos, real packages and prices, signed terms. Concierge-manage their listings at first; self-serve editing can wait.
- Real domain, landing page, basic SEO, analytics (request→approval funnel, time-to-approve), Sentry error monitoring, staging environment.
- Rate limiting and abuse controls: spam requests to venues would burn the whole supply side's trust in one weekend.
- No-show and dispute playbook, manual at first.
- Age gate (21+) and city expansion checklist.

### Phase 5 · Scale

- Auto-approve rules per venue (instant book where the venue opts in).
- Venue-published live availability and hours (the PLAN vision).
- Compare-quotes mode revisited as a real feature where venues want to bid.
- Promoter mobile app or PWA. More cities.

### Blocking decisions (needed before their phase starts)

| Decision | Blocks |
|---|---|
| Cancellation/refund policy: who keeps what, cutoff times | Phase 3 |
| Deposit timing confirmed: charge on approval (proposed above) vs charge upfront | Phase 3 |
| Venue verification: who counts as the legit promoter for a venue | Phase 2 |
| Customer identity: OTP-only (proposed) vs accounts | Phase 2 |
| Business entity + bank account (needed for Stripe and venue agreements) | Phase 3 |

### Long-lead items (start early, they gate everything)

1. **A2P 10DLC registration** (Twilio, weeks of carrier review) gates all US SMS in Phase 2.
2. **Venue relationships**: signing 3 to 5 Orlando venues is the real bottleneck, not code. The demo is the sales tool; start showing it now.
3. **Stripe account + Connect onboarding** needs the business entity.
4. **Licensed venue photography.** The demo currently hotlinks TEMP photos from three real Orlando venues (The Beacham, Mango's Tropical Cafe, ICEBAR; see `TEMP_REAL_PHOTOS` in `app.js` and the copy in `preview-airbnb.html`) purely to judge the look. **Hard launch blocker:** replace with our own licensed photos, with each venue's permission, before anything public.

## Next actions + expected costs (agreed 2026-07-19)

Priority order:

1. **Pitch the demo to 3 to 5 Orlando venues** (Raz + Emmett, no code). Goal: one venue says "we'd approve requests through this." This is the bottleneck for everything.
2. **Form the business entity + bank account** (FL LLC, ~$125 filing). Blocks Stripe, Twilio branding, venue contracts. Cheap and slow, start now.
3. **Start Twilio A2P 10DLC registration** (US texting approval, weeks of carrier review). Gates all Phase 2 SMS.
4. Decide: venue verification + OTP-only identity (blocks Phase 2); cancellation policy + charge-on-approval (blocks Phase 3).
5. **Build Phase 2** "one real booking": Supabase, server-side pricing, OTP, magic link, Twilio, realtime, expiry, inventory.
6. **Build Phase 3** money: Stripe charge-on-approval, Connect payouts w/ 10% commission, real split deposits, ToS.
7. Along the way: licensed photos when venues sign, real domain, mobile polish, logo.

Costs (rates as of Jul 2026, re-check at signup):

| Stage | Monthly | One-time |
|---|---|---|
| Demo (today) | $0 (Netlify + GitHub free) | $0 |
| Phase 2 pilot | ~$10 to 40 (Twilio number + SMS ~$8/1k texts; Supabase free, Pro $25 later) | ~$50 to 100 (10DLC registration, domain ~$15/yr) |
| Phase 3 money | ~$40 to 80 (Stripe has no monthly fee) | ~$200 to 400 (FL LLC; optional lawyer pass $500 to 1,500) |
| Phase 4 launch | ~$75 to 150 all-in until real volume | photos (often free from signed venues' press kits) |

Per-transaction: Stripe ~2.9% + $0.30 per deposit charge (+~0.25% Connect payout). A $240 deposit costs ~$7.85; the 10% commission ($24) covers it, but thin deposits on cheap tables get tight. Claude API (sign ideas / concierge) is under $5/mo at pilot scale. Bottom line: pilot runs under $50/mo; the real costs are venue-sales time and ~$300 of paperwork.

## Open questions (not yet decided)

- No-show handling and dispute flow
- Whether promoters see competing quotes in compare mode (currently: no)
- When/how a venue graduates from approval to instant book to published live availability

## People

- Raz · [@Raz-Gits](https://github.com/Raz-Gits)
- Emmett · [@emmettrosenblum-dot](https://github.com/emmettrosenblum-dot)
