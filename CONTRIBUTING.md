# Contributing to BookOut

Small team, simple rules. The point is that **every change lands as a Pull Request** so we both see what's going in.

## The one rule: no direct pushes to `main`

`main` is protected. You **cannot** push to it directly, even with write access. Everything goes through a PR that Raz reviews. `main` is what deploys to Netlify, so it stays reviewed and working.

## Workflow

1. **Sync main**
   ```bash
   git checkout main
   git pull
   ```
2. **Branch** (short, descriptive name):
   ```bash
   git checkout -b feature/promoter-inbox      # new feature
   git checkout -b fix/countdown-flash         # bug fix
   ```
3. **Make your change**, commit in small logical steps.
4. **Push the branch and open a PR:**
   ```bash
   git push -u origin feature/promoter-inbox
   ```
   GitHub prints a link, or run `gh pr create`. Open the PR **into `main`**.
5. **Fill in the PR template** and **request review from [@Raz-Gits](https://github.com/Raz-Gits)**.
6. **Merge after approval.** Squash-merge is fine. Delete the branch after.

## Before you open a PR

- [ ] `node --check app.js` passes (no syntax errors).
- [ ] You opened `index.html` in a browser and clicked through the flow you touched.
- [ ] No **em dashes** in any copy (house style). Use `·`, commas, or colons.
- [ ] If you changed a product decision, you updated [PLAN.md](PLAN.md).
- [ ] No secrets/keys committed. Real Twilio/Stripe/Supabase keys will live in env vars, never in the repo.

## About the project

- It's a **static site**: `index.html`, `styles.css`, `app.js`. No build step, no dependencies, no framework.
- Design language is Airbnb-style (white canvas, single Rausch accent `#ff385c`, Inter). Keep new UI consistent with it.
- Decisions of record live in **[PLAN.md](PLAN.md)**. Read it before proposing product changes.

## Commit messages

Short imperative subject (`Fix countdown flashing after window closes`), a blank line, then why if it's not obvious. Reference an issue with `#<number>` when there is one.

## Keep PRs small

One focused change per PR beats a giant one. Easier to review, easier to roll back. If a change grows, split it.

Questions? Open an issue or ping Raz.
