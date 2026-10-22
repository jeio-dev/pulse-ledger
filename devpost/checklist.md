---
doc: checklist
status: approved
---
<!-- `status` is the progress state every skill reads. Write `draft` when you first save this file,
     and change it to `approved` when the learner clearly approves the displayed plan ("looks good" counts).
     Do not request a second sign-off. Never skip the draft save —
     an unsaved draft dies with the conversation. -->

<!-- Progress state for `5-build`. `5-build` reads this file to find the next
     unchecked slice, and rewrites it as it goes — ticking boxes and appending to
     Revisions. Every slice MUST carry the same fields in the same order so parsing
     stays reliable. `Learner check:` gives the learner a plain-language way to
     try the completed behavior in learn mode and at fast-mode checkpoints.
     Keep this checklist in Markdown only, regardless of Review Format.

     Internally, a slice is a thin end-to-end increment that makes a real part of the product
     usable, never a lone layer like "build the data model". Slice 1 includes project
     bootstrapping — scaffold, dependencies, config — as part of delivering its first
     real behavior. The examples below show the format; replace them entirely. -->

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Brain-dump or pick a preset and parse it into structured cashflow categories**
  Becomes usable: A running single-screen dark fintech workspace where you can click any of the 3 preset scenario pills (`Post-Payday Squeeze`, `Freelancer Month`, `Shop & Side-Hustle`) or type a messy monthly cashflow paragraph, click **Analyze Cashflow**, and see extracted `Monthly Income` and categorized expense rows (`Fixed Essentials`, `Flexible Living`, `Discretionary Wants`) with 1-line saving tips (plus inline feedback when input has no dollar amounts).
  Why now: Bootstraps the Next.js + TypeScript + Tailwind + Zod stack and immediately proves the highest-risk technical boundary end to end—the `src/lib/schemas.ts` contract, `POST /api/parse-budget` OpenRouter integration, and the deterministic regex/keyword fallback parser (`src/lib/fallback-parser.ts`)—so later UI slices build on verified parsed data.
  PRD ref: `prd.md > The Core Journey` (Steps 1–3), `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > 1. Brain-Dump Input, Presets, and Resilient Parsing`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > Components`, `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`
  Build: Scaffold the Next.js App Router + TypeScript + Tailwind CSS + Zod + Lucide project per `spec.md > File Structure`, preserving `.gitignore` privacy rules and adding `.env.example`. Implement `src/lib/schemas.ts`, `src/lib/presets.ts`, `src/lib/fallback-parser.ts` (handling both preset matching and custom free-form income/expense clause separation), and `src/app/api/parse-budget/route.ts` (Zod validation, 422 unparseable check, 6s OpenRouter fetch, deterministic fallback). Build `src/components/InputPanel.tsx`, `src/components/ReadyEmptyState.tsx`, and the initial `src/app/page.tsx` two-column dark ledger shell rendering parsed categories.
  Verify (mechanical): Run `npm run build` (or typecheck) and start the dev server; test `POST /api/parse-budget` with each preset, a custom multi-clause sentence (with both income and expenses, and expenses-only), and a no-number string (confirming HTTP 422); verify the page renders cleanly with `200 OK`.
  Learner check: Open `http://localhost:3000`, click **Post-Payday Squeeze** (or type a custom monthly summary), click **Analyze Cashflow**, and confirm the categorized expense rows and `Fallback Parser` / `AI` badge appear in the right panel; also test typing words with no dollar numbers to see the inline hint.
  Commit: `Add cashflow parser API, Zod schemas, presets, and input workspace`

- [x] **2. Scrub What-If sliders to simulate cuts and watch Safe Daily Spend & 1-Year Impact flip in real time**
  Becomes usable: The complete Unique Kernel is live: the Right Column displays the 3 top KPI cards (**Monthly Surplus / Deficit**, **Safe Daily Allowance vs. Actual Daily Spend**, **Largest Leak & 1-Year Impact**), the **Visual Proportion Bar**, the conditional **Expense-Only Breakdown Banner** (`monthlyIncome === 0`), and the interactive **What-If Category Ledger** where `Fixed Essentials` stay locked (`Locked` badge) while dragging `0%–150%` sliders (`step={5}`) on `Flexible Living` and `Discretionary Wants` recalculates every metric, delta badge, and traffic-light status badge (`emerald` / `amber` / `rose`) at 60fps, plus **Reset Sliders**.
  Why now: Delivers the core Unique Kernel (`scope.md > The Unique Kernel`) immediately after parsing works, enforcing the single-source-of-truth `computeSimulatedAmount` normalization rule (`spec.md > Data Model`) and enabling an early hands-on checkpoint where slider feel and visual hierarchy can be reviewed.
  PRD ref: `prd.md > The Core Journey` (Steps 4–5), `prd.md > 2. Top Metric Strip & Cashflow Formulas`, `prd.md > 3. Visual Proportion Bar`, `prd.md > 4. Interactive What-If Category Ledger & Sliders`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components`, `spec.md > Data Model`
  Build: Implement `src/lib/calculations.ts` (`computeSimulatedAmount` clamping `"essential"` to `100%` and rounding `simulatedAmount`, plus `computeDerivedMetrics` for 30-day daily allowance/burn, traffic-light status thresholds, largest leak bucket, annualized savings, and proportion bar percentages). Build `src/components/ExpenseOnlyBanner.tsx`, `src/components/TopMetricStrip.tsx`, `src/components/ProportionBar.tsx`, and `src/components/CategoryLedger.tsx` (with Radix/shadcn `0%–150%` sliders on `"flexible"` and `"want"` rows, locked `"essential"` rows, and **Reset Sliders**), and wire them into `src/app/page.tsx` via `useMemo`.
  Verify (mechanical): Verify calculation invariants (`computeSimulatedAmount` and `computeDerivedMetrics`) against the **Post-Payday Squeeze** preset (`$2,600` income, initial deficit `-$85/mo`, `Rose` badge; trimming flexible/want sliders flips balance and daily burn to `Emerald` and calculates `12x` annualized savings) and verify clean TypeScript build and dev server render.
  Learner check: Open `http://localhost:3000`, analyze **Post-Payday Squeeze**, drag two non-fixed sliders down to watch the **Safe Daily Allowance vs. Actual Daily Spend** badge flip from `Rose` to `Emerald` and the 1-year savings projection climb in real time, confirm `Fixed Essentials` rows are locked, and test **Reset Sliders** (plus entering inline income on an expense-only input).
  Commit: `Add live What-If sliders, 30-day KPI cards, proportion bar, and expense-only banner`

- [x] **3. Copy the 5-part Markdown Action Plan and persist the workspace across browser reloads**
  Becomes usable: Clicking **Copy Action Plan** in the bottom bar copies the formatted 5-part Markdown budget summary and `- [ ]` target-cut checklist to your clipboard with a `"Copied!"` confirmation state; reloading the browser restores your active input, parsed ledger, and slider positions from `localStorage["pulse_ledger_state"]`; and clicking **Clear All** wipes storage and returns to the **Ready to Analyze** empty state.
  Why now: Completes Step 6 of the core journey and wires up `localStorage` persistence once the `BudgetLedgerState` schema and slider calculations are locked in.
  PRD ref: `prd.md > The Core Journey` (Step 6), `prd.md > 5. Copy Action Plan & Workspace Persistence`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Implement `src/lib/markdown-export.ts` (`formatActionPlanMarkdown` producing `# PulseLedger Monthly Action Plan` with Cashflow Summary, Daily Pace, 1-Year Impact, and `- [ ]` Actionable Cuts Checklist) and `src/components/ActionPlanBar.tsx` (active cuts summary, **Reset Sliders**, and **Copy Action Plan** with 2-second `"Copied!"` state). Add `localStorage["pulse_ledger_state"]` hydration (validated via `BudgetLedgerStateSchema.safeParse` + `computeSimulatedAmount` normalization, removing corrupt entries cleanly) and sync in `src/app/page.tsx`, plus wire **Clear All** to clear `localStorage` and reset state.
  Verify (mechanical): Verify `formatActionPlanMarkdown` output contains all 5 required sections and accurate cut checkboxes; verify `BudgetLedgerStateSchema` hydration and corrupt-storage recovery; run `npm run build` to confirm zero TypeScript or Next.js build errors.
  Learner check: Adjust two sliders, click **Copy Action Plan**, and paste the Markdown into a text editor to inspect the 5-part checklist; reload the browser to confirm your workspace and slider positions persist; then click **Clear All** to confirm it resets to the empty state.
  Commit: `Add Markdown action plan exporter and localStorage workspace persistence`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after Slice 2 (brain-dump parsing + live What-If slider simulation & KPI cards)
- [x] Final kick-the-tires exploration and feedback completed — after Slice 3 (full core journey with Markdown export & persistence)

## Final Review

- [x] No revisions requested during final kick-the-tires review — all 3 slices verified and confirmed ready
- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Connected prior spec-to-schema-to-slice practice (`spec.md > Data Model > Synchronization Rule` and `spec.md > Decisions and Open Issues > Build-Time Scrutiny Items`) to actual build verification in `src/lib/calculations.ts` (`computeSimulatedAmount` clamping `"essential"` to `100%` across parse, slider, reset, and hydration) and `src/lib/fallback-parser.ts` (where Slice 1 verification caught `"after tax"` colliding with standalone `tax` in expense keywords, recorded under `## Revisions`).
Route and stops: Reference route prepared in `devpost/app-map.html`: Stop 1 `src/lib/schemas.ts` (`ExpenseItemSchema`, `BudgetResponseSchema`, `BudgetLedgerStateSchema`) -> Stop 2 `src/lib/calculations.ts` (`computeSimulatedAmount`, `normalizeLedgerState`, `computeDerivedMetrics`) -> Stop 3 `src/app/page.tsx` & `src/components/CategoryLedger.tsx` (`handleSliderChange`, `parseSavedLedgerState`).
Edit outcome: not applicable (prior spec-to-slice verification practice connected directly; pointers for future edits documented in `devpost/app-map.html`).
Reflection: offered optional transfer question at wrap-up.
Activity mode: prior practice connected + evidence-based recap and standalone `devpost/app-map.html` (verified paths/symbols against source at commit `eb92df4`; headless CLI environment without GUI browser).

## Revisions

- Refined `src/lib/fallback-parser.ts` essential keyword rule (`property tax` instead of standalone `tax`) — Slice 1 verification discovered that income sentences phrased as `"I earn $3,800 a month after tax"` were matching `tax` as an expense keyword instead of monthly income.
- Updated `src/app/api/parse-budget/route.ts` for OpenRouter `:free` / Nemotron models — testing with `OPENROUTER_MODEL=nvidia/nemotron-3.5-super-vl:free` revealed that Nemotron 3.5 models generate long hidden reasoning traces unless `reasoning: { effort: "none", exclude: true }` is passed, and `super-vl:free` can queue for >15s; added `reasoning: { effort: "none", exclude: true }`, extended timeout, and automatic failover to `nvidia/nemotron-3.5-lightning:free` before dropping to the local fallback parser.
