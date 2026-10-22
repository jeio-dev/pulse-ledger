---
doc: prd
status: approved
---

# PulseLedger — Product Requirements

A single-screen, plain-English personal cashflow tracker for busy individuals, freelancers, and students who want an instant snapshot of monthly income vs. spending, Safe Daily Allowance vs. Actual Daily Spend, and live What-If expense simulation without manual spreadsheet data entry.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **Arrive at Workspace:** The user opens PulseLedger on a single-screen two-column workspace. With no prior `localStorage` data, the Left Column shows an empty natural-language textarea, 3 preset scenario pills (**Post-Payday Squeeze**, **Freelancer Month**, **Shop & Side-Hustle**), a disabled **Analyze Cashflow** button, and a **Clear All** button. The Right Column displays a **Ready to Analyze** empty-state panel.
2. **Input or Select a Preset:** The user either types/pastes a messy paragraph describing their monthly income and expenses or clicks one of the 3 preset pills (e.g., **Post-Payday Squeeze**), which populates the textarea and enables **Analyze Cashflow**.
3. **Analyze Cashflow:** The user clicks **Analyze Cashflow**. The app parses the text (via AI extraction or automatic deterministic regex/keyword fallback if offline or missing an API key) into `Monthly Income` and 3 expense buckets: `Fixed Essentials`, `Flexible Living`, and `Discretionary Wants`.
4. **Inspect Top Metrics & Proportion Bar:** The Right Column immediately renders:
   - **Top Metric Strip (3 Cards):** **Monthly Surplus / Deficit**, **Safe Daily Allowance vs. Actual Daily Spend**, and **Largest Leak & 1-Year Impact**.
   - **Visual Proportion Bar:** A horizontal stacked bar showing the exact percentage split across `Fixed Essentials`, `Flexible Living`, `Discretionary Wants`, and `Remaining Surplus` (or deficit indicator).
5. **Simulate Cuts with What-If Sliders:** Below the proportion bar, expense items are grouped by category in compact terminal-style rows. `Fixed Essentials` are locked as read-only rows with a Lock badge. The user drags **0%–150% What-If sliders** on individual `Flexible Living` and `Discretionary Wants` items, watching simulated amounts, category subtotals, traffic-light status badges (`emerald` / `amber` / `rose`), **Actual Daily Spend**, and **Annualized Savings Projection** recalculate instantaneously without another AI call.
6. **Reset or Export Action Plan:** The user can click **Reset Sliders** to snap all adjustable sliders back to `100%` baseline, or click **Copy Action Plan** in the bottom action bar to copy a formatted Markdown budget & checklist of target cuts to their clipboard (triggering a `"Copied!"` toast confirmation).

## Screens and Layout
Source: `scope.md > The POC Boundary`, `scope.md > The Core Loop`.

PulseLedger is a **single-screen responsive two-column workspace** on desktop (stacking vertically on smaller screens) with zero multi-page navigation:

- **Left Column (Input Panel):**
  - **Preset Strip:** 3 one-click scenario pills at the top:
    1. **Post-Payday Squeeze:** `$2,600` monthly income; tight paycheck pushed into slight deficit by convenience snacks, weekend dining, and impulse shopping.
    2. **Freelancer Month:** `$4,200` client income; healthy top-line income eroded by daily cafe runs, late-night takeout, unused SaaS subscriptions, and gear upgrades.
    3. **Shop & Side-Hustle:** `$3,550` combined salary + weekend printing side-hustle; mixed household bills, supply restocks, rideshares, and PC upgrades.
  - **Brain-Dump Textarea:** Plain-English multiline input with a clear placeholder prompt explaining what to paste or type.
  - **Action Controls:** Primary **Analyze Cashflow** button (disabled when textarea is empty/whitespace) and secondary **Clear All** button.
- **Right Column (Interactive Dashboard):**
  - **Conditional Top Banner (Expense-Only Breakdown Mode):** Appears only when parsed text contains expenses but no monthly income, offering an inline numeric input to enter monthly income immediately.
  - **1. Top Metric Strip:** 3 high-contrast metric cards side by side.
  - **2. Visual Proportion Bar:** Full-width horizontal stacked bar with percentage legend across the 3 expense buckets and remaining surplus.
  - **3. Interactive What-If Category Ledger:** Category groups (`Fixed Essentials`, `Flexible Living`, `Discretionary Wants`) with a **Reset Sliders** action and compact expense rows.
  - **4. Bottom Action Bar:** **Copy Action Plan** primary action button with `"Copied!"` toast state.

## Look and Feel
Source: `scope.md > Inspiration & Identity`.

- **Aesthetic Direction:** High-contrast dark fintech ledger inspired by Linear and Stripe dark dashboards—clean financial utility rather than generic consumer budgeting fluff.
- **Surface Palette:** Deep `slate-950` background canvas and elevated dark card surfaces separated by crisp 1px `slate-800` borders.
- **Typography Pairing:**
  - **UI & Category Labels:** Clean geometric sans-serif (`Geist Sans` or `Inter`).
  - **Currency Figures, Percentages, & Badges:** Monospace (`Geist Mono` or `JetBrains Mono`) with `tabular-nums` enforced across all metrics, row amounts, and slider readouts so numbers align vertically and never jitter during real-time slider scrubbing.
- **Density:** Compact, high-density terminal-style expense rows.
- **Traffic-Light Semantic Badges:**
  - **Emerald (Healthy Surplus):** Monthly surplus `>= 10%` of Monthly Income (and `Actual Daily Spend <= Safe Daily Allowance`).
  - **Amber (Tight Margin):** Monthly surplus between `0%` and `< 10%` of Monthly Income.
  - **Rose (Deficit / Overspend):** Monthly balance `< $0` (`Actual Daily Spend > Safe Daily Allowance`).

## Features and Behavior

### 1. Brain-Dump Input, Presets, and Resilient Parsing
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop` (Steps 1–2), `scope.md > The POC Boundary`.

- Clicking any of the 3 preset pills (**Post-Payday Squeeze**, **Freelancer Month**, **Shop & Side-Hustle**) replaces the textarea content with that realistic plain-English paragraph so the user can immediately click **Analyze Cashflow** (or edit the text first).
- Clicking **Analyze Cashflow** extracts:
  - `Monthly Income` (`$0` if omitted, triggering **Expense-Only Breakdown Mode**).
  - Categorized line items assigned to one of three buckets: `Fixed Essentials`, `Flexible Living`, or `Discretionary Wants`.
  - A concise 1-line saving tip for each adjustable (`Flexible Living` and `Discretionary Wants`) line item.
- **Resilient Fallback Parser:** If the AI API times out, errors, or has no configured API key, PulseLedger automatically parses the text using a built-in deterministic regex/keyword fallback parser so live demos and offline usage never fail.
- **Acceptance Criteria:**
  - [ ] **Analyze Cashflow** is disabled when the textarea is empty or whitespace-only, and enabled as soon as text is typed or a preset pill is clicked.
  - [ ] Clicking each of the 3 preset pills populates distinct, realistic natural-language text matching its scenario (**Post-Payday Squeeze** `$2,600`, **Freelancer Month** `$4,200`, **Shop & Side-Hustle** `$3,550`).
  - [ ] Analyzing text produces structured line items grouped under `Fixed Essentials`, `Flexible Living`, and `Discretionary Wants`, resetting initial What-If slider multipliers to `100%`.
  - [ ] With no API key or simulated network failure, **Analyze Cashflow** completes via the deterministic fallback parser without throwing an unhandled error.

### 2. Top Metric Strip & Cashflow Formulas
Source: `scope.md > The Core Loop` (Step 3), `scope.md > What "Working" Looks Like`.

All metrics use a **30-day month** and recalculate live as What-If sliders move:
- **Core Formulas:**
  - `Simulated Item Amount = Baseline Item Amount * (Slider % / 100)` (for `Flexible Living` and `Discretionary Wants`; `Fixed Essentials` remain at `100%`).
  - `Simulated Total Spend = Total Fixed Essentials + Total Simulated Flexible Living + Total Simulated Discretionary Wants`
  - `Monthly Surplus / Deficit = Monthly Income - Simulated Total Spend`
  - `Safe Daily Allowance = (Monthly Income - Total Fixed Essentials) / 30`
  - `Actual Daily Spend = (Total Simulated Flexible Living + Total Simulated Discretionary Wants) / 30`
  - `Annualized Savings Projection = max(0, (Baseline Total Spend - Simulated Total Spend) * 12)`
- **Card 1 — Monthly Surplus / Deficit:** Displays the current simulated monthly balance (`+$/mo` or `-$/mo`), baseline comparison, and traffic-light semantic badge (`Emerald` `>= 10%` income, `Amber` `0%–10%` income, `Rose` `< $0`).
- **Card 2 — Safe Daily Allowance vs. Actual Daily Spend:** Displays `Safe Daily Allowance` (`$/day`) alongside live `Actual Daily Spend` (`$/day`), daily buffer/overspend delta, and status badge (`Emerald` when `Actual <= Safe`, `Rose` when `Actual > Safe`).
- **Card 3 — Largest Leak & 1-Year Impact:** Displays the **Largest Leak Category** name and its current dollar spend at the top of the card, paired right below with the **Annualized Savings Projection** (`$ saved/mo × 12`) highlighted as the user trims sliders.
- **Acceptance Criteria:**
  - [ ] All 3 cards render formatted currency figures in monospace `tabular-nums`.
  - [ ] Dragging any slider immediately updates Card 1, Card 2, and Card 3 in real time without triggering a network request.
  - [ ] On the **Post-Payday Squeeze** preset, initial analysis shows a tight/deficit badge (`Rose` or `Amber`), and dragging two non-fixed sliders down flips the status badge to `Emerald` while displaying a positive 1-year projected savings amount in Card 3.

### 3. Visual Proportion Bar
Source: `scope.md > The Core Loop` (Step 3), `scope.md > The POC Boundary`.

- Renders a horizontal stacked bar above the category ledger showing the live percentage breakdown of:
  1. `Fixed Essentials`
  2. `Flexible Living`
  3. `Discretionary Wants`
  4. `Remaining Surplus` (when `Monthly Surplus > 0`)
- When total spend exceeds monthly income (or in Expense-Only Breakdown Mode), segment widths represent each bucket's percentage of `Simulated Total Spend` with a clear deficit indicator.
- **Acceptance Criteria:**
  - [ ] Segment widths and percentage labels update smoothly in real time as What-If sliders are dragged.

### 4. Interactive What-If Category Ledger & Sliders
Source: `scope.md > The Core Loop` (Step 4), `scope.md > Explicitly Cut`.

- Expenses are displayed in 3 category sections (`Fixed Essentials`, `Flexible Living`, `Discretionary Wants`), each showing its category header and live subtotal (`$`).
- **Locked `Fixed Essentials` Rows:**
  - Strictly read-only—no slider is rendered.
  - Displays: **Item Label**, **Locked Badge** (`Locked`), and **Amount (`$`)**.
- **Adjustable `Flexible Living` & `Discretionary Wants` Rows:**
  - Interactive range slider from **`0%` to `150%`** (default `100%`, step `5%` or `1%`).
  - Displays: **Item Label**, **Baseline Amount** (`$` muted), **Simulated Amount** (`$` bold), **Slider % & Delta Badge** (e.g., `70% (-$60)`), the **0%–150% Slider Control**, and a **1-line AI saving tip** underneath.
- **Reset Sliders Control:**
  - Clicking **Reset Sliders** in the Right Column resets all `Flexible Living` and `Discretionary Wants` sliders back to `100%` without clearing the parsed ledger or textarea.
- **Acceptance Criteria:**
  - [ ] `Fixed Essentials` rows never render sliders and display a `Locked` badge.
  - [ ] `Flexible Living` and `Discretionary Wants` rows allow dragging from `0%` to `150%`, updating the row's simulated `$`, `% (delta $)` badge, category subtotal, proportion bar, and top metric cards instantaneously.
  - [ ] Clicking **Reset Sliders** restores all sliders to `100%` and returns all simulated metrics to their baseline parsed values.

### 5. Copy Action Plan & Workspace Persistence
Source: `scope.md > The Core Loop` (Step 5), `scope.md > The POC Boundary`.

- **Copy Action Plan:** Clicking **Copy Action Plan** in the bottom action bar writes a structured Markdown summary to the system clipboard and displays a `"Copied!"` toast/button state for 2 seconds:
  - `# PulseLedger Monthly Action Plan`
  - **Cashflow Summary:** Monthly Income, Baseline Total Spend vs. Simulated Total Spend, and Baseline Surplus/Deficit vs. Simulated Surplus/Deficit.
  - **Daily Pace (30-Day Month):** Safe Daily Allowance vs. Simulated Daily Spend (and `$/day` buffer).
  - **1-Year Impact:** Projected Annual Savings (`$X/year` from `$Y/month` in cuts).
  - **Actionable Cuts Checklist:** Markdown checkboxes (`- [ ] Cut [Item Label] from $Baseline to $Simulated (Save $Diff/mo)`) for every item adjusted below `100%` (or a note if no cuts are currently active).
- **Persistence & Clear All:**
  - Active input text, parsed cashflow data, and current What-If slider percentages persist in `localStorage` so refreshing the browser keeps the workspace intact.
  - Clicking **Clear All** in the Left Column clears the textarea, resets the Right Column back to the **Ready to Analyze** empty state, and clears the saved `localStorage` state.
- **Acceptance Criteria:**
  - [ ] Clicking **Copy Action Plan** copies the exact 5-part Markdown structure to the clipboard and shows `"Copied!"` feedback.
  - [ ] Reloading the browser restores the last analyzed ledger and slider positions from `localStorage`.
  - [ ] Clicking **Clear All** wipes `localStorage`, clears the input textarea, and returns the Right Column to the **Ready to Analyze** empty state.

## States and Boundaries
Source: `scope.md > The POC Boundary`, `scope.md > Explicitly Cut`.

- **First Use / Empty Workspace State:** When `localStorage` is empty (or after clicking **Clear All**), the Left Column textarea is empty with **Analyze Cashflow** disabled, and the Right Column shows the **Ready to Analyze** empty state panel prompting the user to paste a summary or pick one of the 3 presets.
- **Expense-Only Breakdown Mode (Missing Income State):** When the user analyzes text that includes expenses but no recognizable monthly income (`Monthly Income == 0`), the Right Column displays a gentle banner at the top with a quick inline monthly income input. Until income is entered, expense categories, proportion splits, and What-If savings cuts still function in Expense-Only mode; entering an income number in the banner immediately unlocks Surplus/Deficit and Safe Daily Allowance calculations without re-running AI parsing.
- **Fallback Parser State (Offline / Missing Key / Timeout):** If the AI parsing request fails, times out, or lacks an API key, the deterministic regex/keyword fallback parser extracts income and categorizes expenses automatically, showing a subtle non-blocking badge (`Fallback Parser`) so the user is never blocked by an error screen.
- **Unparseable Input State:** If the submitted text contains no recognizable currency numbers at all, show a clear inline message prompting the user to include dollar amounts (or try a preset pill) while keeping their input text intact.
- **Client-Side Persistence Boundary:** All state lives strictly in React state + browser `localStorage` for a single active monthly workspace.

## Product Decisions

- **Two-column single-screen workspace (Input Left, Interactive Dashboard Right):** Keeps the entire brain-dump-to-What-If simulation loop visible on one screen without navigation friction.
- **Locked `Fixed Essentials` vs. Adjustable `Flexible Living` & `Discretionary Wants` (0%–150%):** Rent and fixed bills cannot realistically be slid down mid-month; locking them keeps daily allowance math and What-If simulations grounded in reality.
- **Card 3 combines `Largest Leak & 1-Year Impact`:** Preserves the scope's Largest Leak Category callout while giving immediate visual weight to annualized savings (`$ saved/mo × 12`) as sliders move.
- **Split `Reset Sliders` vs. `Clear All` controls:** Prevents users who only want to undo slider experiments (`Reset Sliders`) from accidentally wiping their parsed cashflow workspace (`Clear All`).
- **Expense-Only Breakdown Mode with inline income banner:** Handles messy brain-dumps where users only list what they spent, letting them add their monthly income inline without re-typing and re-parsing the paragraph.
- **Deterministic fallback parser:** Guarantees the proof of concept works reliably offline, without API keys, or during live 1-minute demo recordings.

## What We're Building
Source: `scope.md > The POC Boundary`.

1. Single-screen two-column workspace with dark fintech ledger styling (`slate-950`/`slate-800`, monospace `tabular-nums`, traffic-light semantic badges).
2. Left Input Panel with 3 realistic preset pills (**Post-Payday Squeeze**, **Freelancer Month**, **Shop & Side-Hustle**), plain-English textarea, **Analyze Cashflow**, and **Clear All**.
3. Cashflow parser (AI extraction + automatic deterministic regex/keyword fallback) categorizing into `Monthly Income`, `Fixed Essentials`, `Flexible Living`, and `Discretionary Wants` with 1-line saving tips.
4. Expense-Only Breakdown Mode banner with quick inline monthly income input when income is omitted from the text.
5. Right Interactive Dashboard with 3 live metric cards (**Monthly Surplus/Deficit**, **Safe Daily Allowance vs. Actual Daily Spend**, **Largest Leak & 1-Year Impact**), **Visual Proportion Bar**, and **Category Ledger** (locked `Fixed Essentials` rows + `0%–150%` What-If sliders on `Flexible Living` and `Discretionary Wants` + **Reset Sliders**).
6. **Copy Action Plan** button with `"Copied!"` toast and 5-part Markdown clipboard export, plus `localStorage` session persistence.

## Deferred From the POC
Source: `scope.md > Later`.

- **Saved custom user presets:** Implied by preset pills, but hardcoded to 3 realistic presets for the PoC to keep state single-workspace.
- **Historical snapshots / multiple saved months:** `localStorage` stores only the current active workspace; multi-month storage is deferred.

## Possible Later Enhancements
Source: `scope.md > Later`.

- Multi-month historical trend comparisons and month-over-month daily burn tracking.
- Custom user-defined category rules and personal saved scenario templates.
- Direct CSV or bank statement file import alongside plain-English text input.

## Non-Goals
Source: `scope.md > Explicitly Cut`.

- **User login and authentication:** Adds setup friction and zero value to proving the 60-second brain-dump-to-What-If core loop.
- **External database:** React state + `localStorage` is sufficient for a single-screen PoC and keeps the architecture zero-config.
- **Bank account linking (Plaid) or CSV uploads:** Defeats the core premise of instant, low-friction plain-English brain-dumping.
- **Multi-month historical charts:** Distracts from the immediate single-month cashflow triage loop.
- **Sliders on Fixed Essentials:** Rent and fixed bills can't realistically be dragged down mid-month; locking them as read-only keeps simulations realistic.

## Open Questions

None blocking `4-spec`. All layout, formula, slider boundary, preset, export format, and edge-case behaviors are defined.
