# BOOKOUT◈ · Venue Bookings Collab (Raz × Emmett)

**One request. Every venue answers.**

A nightlife booking marketplace demo: customers browse Orlando venues, pick the ones they want, send one request, and every venue's promoter gets texted. Promoters reply with quotes inside a 1-hour window, and the customer compares quotes and books with a deposit.

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

- **Customer flow:** browse the venue grid (pre-selected, tap to add/remove), set your night (Venues or Tables, area, date, start, guests as a manual count, occasion, budget as a manual total) → one request texts every selected promoter → quotes stream in live under a 1-hour countdown → compare, book, pay a mock deposit → confirmation.
- **Quote window:** the real product gives promoters 1 hour; the demo compresses it to **60 seconds (1 min = 1 hr)** so demos don't drag.
- **Promoter view** (button in the header): a simulated phone showing the venue's BookOut app. The promoter gets the request as a **text notification** and sees it laid out in-app: an organized request card (date, time, party, occasion, area, budget) plus an inline quote form. Submit a quote and watch it appear live on the customer's board. One selected venue is always reserved for you to play and never auto-quotes.

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
