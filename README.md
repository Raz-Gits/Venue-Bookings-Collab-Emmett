# BOOKOUT◈ · Venue Bookings Collab (Raz × Emmett)

**Book the night out. Every venue, one tap away.**

A nightlife booking marketplace demo: customers browse Orlando venues, open a venue for photos, details, and its open nights, then book a single night instantly with a deposit. Pricing shifts by night, so midweek is cheaper than weekends and booking early earns an early-bird discount.

> **Note:** The customer flow recently moved from a multi-venue quote blast to this Airbnb-style **browse → venue page → instant book** model (proposed by Emmett, pending Raz review, see the callout in [PLAN.md](PLAN.md)). The live quote board and playable promoter view still exist in the code but are dormant, off the main path.

**All decisions of record live in [PLAN.md](PLAN.md).** This repo currently holds the clickable demo where everything (venues, texts, quotes, payments) is simulated. Demo city: **Orlando, FL**.

## Contributing (read this first)

Two-person team, PR-based workflow. **`main` is protected: nobody pushes to it directly.** See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full rules. Short version:

1. Branch off `main` (`feature/…` or `fix/…`).
2. Open a Pull Request into `main` and fill in the template.
3. Request review from [@Raz-Gits](https://github.com/Raz-Gits); merge after approval.

## Try it locally

No build step, no dependencies. Open `index.html` directly, or:

```bash
npx serve .
```

## Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Pick **GitHub** → authorize → select `Raz-Gits/Venue-Bookings-Collab-Emmett`
3. Leave the **build command empty**, publish directory `.` (the included `netlify.toml` sets this) → **Deploy**

Every push to `main` (i.e. every merged PR) auto-deploys after that.

## What the demo does

- **Customer flow:** browse the venue grid, set your date range and party (Venues or Tables, area, guests, start, occasion) → the deal strip surfaces the cheapest nights across Orlando → open a venue for photos, blurb, capacity/hours, amenities, and a per-night deal calendar → pick a night and **book instantly**, pay a mock deposit → confirmation.
- **Dynamic pricing:** each night is priced by demand (weekends peak, midweek quiet) plus an **early-bird discount** that grows the further out you book (up to 18%). The deal calendar tags nights Quiet · Busy · Peak with a relative price delta and an "Early bird" marker.
- **Dormant (legacy) pieces:** the live quote board and the playable **Promoter view** (header button) remain in the code from the previous quote-blast model, pending Raz's review of the model change. They are not on the current booking path.

## Files

| File | What |
|---|---|
| `index.html` / `styles.css` / `app.js` | The demo SPA (vanilla JS, zero deps, Airbnb design language) |
| `PLAN.md` | Product decisions, phases, vision, open questions |
| `CONTRIBUTING.md` | Collaboration rules and PR workflow |
| `netlify.toml` | Netlify config (no build, publish root) |

## People

- Raz · [@Raz-Gits](https://github.com/Raz-Gits)
- Emmett · [@emmettrosenblum-dot](https://github.com/emmettrosenblum-dot)
