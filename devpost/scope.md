---
doc: scope
status: approved
---

# PulseLedger

A single-screen, plain-English personal cashflow tracker that turns a messy monthly brain-dump into structured expense buckets, compares Safe Daily Allowance against Actual Daily Spend, and lets users simulate expense cuts in real time with interactive What-If sliders.

## The Unique Kernel
Zero-friction natural-language cashflow parsing paired immediately with live What-If simulation: instead of filling out 20 rows of spreadsheet data, the user dumps a messy paragraph of their month's income and spending, sees how much they can safely spend per day outside of fixed bills (`Safe Daily Allowance` vs. `Actual Daily Spend`), and drags 0%–150% sliders on non-fixed line items to watch their daily burn rate and 1-year projected savings flip from deficit to surplus in real time.

## Who It's For
Busy individuals, freelancers, and students who want an instant snapshot of where their money went this month and what they can safely spend per day. Today, they either avoid budgeting altogether or abandon traditional trackers and spreadsheets because manually entering dozens of transactions and picking dropdown categories feels like unpaid data-entry work.

## The Core Loop
1. Open PulseLedger and type/paste a messy paragraph of monthly income and expenses (or click one of 3 realistic preset scenarios).
2. Click **Analyze Cashflow** to parse income and categorize every expense into `Fixed Essentials`, `Flexible Living`, or `Discretionary Wants`.
3. Inspect the 3 top-level metric cards (**Net Monthly Surplus**, **Safe Daily Allowance vs. Actual Daily Spend**, and **Largest Leak Category**) plus the visual cashflow breakdown bar.
4. Drag **What-If sliders** (0%–150%) on individual `Flexible Living` and `Discretionary Wants` items while `Fixed Essentials` stay locked as read-only rows, watching category totals, daily burn status, and 1-year projected savings update in real time.
5. Click **Copy Action Plan** to copy a clean Markdown budget summary and target cuts to the clipboard.

## Inspiration & Identity
High-contrast dark fintech ledger inspired by Linear and Stripe's dark dashboards (`https://linear.app`, `https://stripe.com`):
- Deep `slate-950` background surfaces with crisp `slate-800` 1px borders.
- Monospace tabular numbers (`tabular-nums`) across all metrics and sliders so digits never jitter during real-time scrubbing.
- High-signal semantic status badges (`emerald` for surplus/safe burn, `amber` for tight margin, `rose` for deficit/overspend).

## Why This Matters to the Learner
Building PulseLedger is a vehicle to master a repeatable, spec-driven agent workflow—keeping Markdown planning artifacts (`scope.md` -> `prd.md` -> `spec.md`), Zod schemas, and vertical UI build slices strictly aligned without scope drift.

## What "Working" Looks Like
In a 1-minute screen recording, a user clicks the **"Post-Payday Squeeze"** preset paragraph, hits **Analyze Cashflow**, and immediately sees a tight/negative monthly balance with an overspent daily burn badge in rose/red. They then drag two non-fixed expense sliders down—watching the category totals roll up and the **Safe Daily Allowance vs. Actual Daily Spend** badge flip from red/warning to emerald green in real time alongside a 1-year projected savings callout—and click **Copy Action Plan** to grab the resulting Markdown summary.

- **Core Daily Formulas (30-day month):**
  - `Safe Daily Allowance = (Monthly Income - Total Fixed Essentials) / 30`
  - `Actual Daily Spend = (Total Flexible Living + Total Discretionary Wants) / 30`

## The POC Boundary
- Single-screen web app with plain-English text input + 3 preset scenario buttons.
- AI cashflow extraction into `Monthly Income` and 3 expense buckets (`Fixed Essentials`, `Flexible Living`, `Discretionary Wants`).
- 3 top-level summary cards (including 1-year projected savings impact) + visual cashflow bar.
- Read-only rows for `Fixed Essentials` and interactive 0%–150% What-If sliders for individual `Flexible Living` and `Discretionary Wants` line items with instant rollup recalculation.
- **Copy Action Plan** button that copies a formatted Markdown summary to the clipboard.
- Client-side persistence using React state + `localStorage` only.

## Later
- Multi-month historical trend comparisons and month-over-month burn tracking.
- Custom user-defined category rules or saved personal presets.
- Direct CSV / bank statement file import.

## Explicitly Cut
- **User login and authentication:** Adds setup friction and zero value to proving the 60-second brain-dump-to-What-If core loop.
- **External database:** React state + `localStorage` is sufficient for a single-screen PoC and keeps the architecture zero-config.
- **Bank account linking (Plaid) or CSV uploads:** Defeats the core premise of instant, low-friction plain-English brain-dumping.
- **Multi-month historical charts:** Distracts from the immediate single-month cashflow triage loop.
- **Sliders on Fixed Essentials:** Rent and fixed bills can't realistically be dragged down mid-month; locking them as read-only keeps simulations realistic.
