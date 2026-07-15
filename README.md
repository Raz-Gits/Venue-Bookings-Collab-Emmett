# BOOKOUT✶ — Venue Bookings Collab (Raz × Emmett)

**One request. Every venue answers.**

A nightlife booking marketplace demo: customers request a table or full-venue buyout once, every matching venue's promoter gets texted, promoters reply with quotes within a 1-hour window, and the customer compares quotes and books with a deposit.

**All decisions of record live in [PLAN.md](PLAN.md).** This repo currently holds the clickable demo — everything (venues, texts, quotes, payments) is simulated. Demo city: **Orlando, FL**.

## Try it locally

No build step, no dependencies. Either open `index.html` directly, or:

```bash
npx serve .
```

## Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Pick **GitHub** → authorize → select `Raz-Gits/Venue-Bookings-Collab-Emmett`
3. Leave **build command empty**, publish directory `.` (the included `netlify.toml` sets this) → **Deploy**

Every push to `main` auto-deploys after that. (Alternative: drag-and-drop this folder onto the Netlify dashboard.)

## What the demo does

- **Customer flow:** search (type, area, date, time, party size, occasion, optional budget) → matching venue cards all pre-selected → one tap texts every promoter → quotes stream in live under a countdown → compare, book, pay a mock deposit → confirmation.
- **Quote window:** the real product gives promoters 1 hour; the demo compresses it to **60 seconds (1 min = 1 hr)** so demos don't drag.
- **Promoter view** (button in the header): a simulated phone showing the SMS a promoter receives, with the magic-link mini quote form. Submit a quote yourself and watch it appear live on the customer's board — one selected venue is always reserved for you and never auto-quotes.

## Files

| File | What |
|---|---|
| `index.html` / `styles.css` / `app.js` | The demo SPA (vanilla JS, zero deps) |
| `PLAN.md` | Product decisions, phases, open questions |
| `netlify.toml` | Netlify config (no build, publish root) |

## People

- Raz — [@Raz-Gits](https://github.com/Raz-Gits)
- Emmett — *(GitHub invite pending)*
