---
doc: spec
status: approved
---

# PulseLedger — Technical Spec

## How This Works, In Plain Language

PulseLedger is a single-screen Next.js web application built around a strict contract between a **Zod data schema**, a **resilient cashflow parser API route**, and a **zero-latency client simulation loop**:

1. **Brain-Dump Input & Presets (Left Column):** The user types or pastes a messy plain-English paragraph describing their monthly income and expenses—or clicks one of three built-in preset pills (**Post-Payday Squeeze**, **Freelancer Month**, **Shop & Side-Hustle**).
2. **Resilient Parsing (`POST /api/parse-budget`):** When the user clicks **Analyze Cashflow**, the browser sends `{ rawInput }` to a Next.js App Router API route. If an `OPENROUTER_API_KEY` is configured, the route calls OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) with structured JSON output and a 6-second timeout, then validates the response with Zod (`BudgetResponseSchema`). If no API key is present—or if the network call fails, times out, or fails schema validation—the server automatically falls back to a deterministic local regex/keyword parser (including exact pre-mapped payloads for the three presets).
3. **Zero-Latency What-If Simulation (Right Column):** Once parsed, the structured ledger lives in React state (`BudgetLedgerState`) and syncs to browser `localStorage` under `"pulse_ledger_state"`. Every expense item belongs to one of three buckets: `"essential"` (`Fixed Essentials`, locked at `100%`), `"flexible"` (`Flexible Living`, adjustable `0%–150%`), or `"want"` (`Discretionary Wants`, adjustable `0%–150%`). Dragging any What-If slider updates `sliderPercent` in React state and synchronously recalculates simulated item amounts, category subtotals, the 3 top KPI cards, the visual proportion bar, and the Markdown action plan via `useMemo`—with zero network round-trips.

This shape keeps the proof of concept fast, offline-safe, and free of database or authentication ceremony while proving the entire brain-dump-to-What-If simulation kernel on a single screen.

---

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Browser (Client State + localStorage["pulse_ledger_state"])                  │
│                                                                              │
│  ┌─────────────────────────┐    POST /api/parse-budget    ┌───────────────┐  │
│  │ Left Column: InputPanel │ ───────────────────────────► │ Next.js Route │  │
│  │ - 3 Preset Pills        │                              │  Handler      │  │
│  │ - Brain-Dump Textarea   │ ◄─────────────────────────── │  (Zod Check)  │  │
│  │ - Analyze / Clear All   │   BudgetResponseSchema JSON  └───────┬───────┘  │
│  └─────────────────────────┘                                      │          │
│                                                    ┌──────────────┴────────┐ │
│  ┌──────────────────────────────────────────────┐  │ 1. OpenRouter Fetch   │ │
│  │ Right Column: Interactive Dashboard          │  │    (6s timeout, JSON) │ │
│  │ - ExpenseOnlyBanner (if monthlyIncome === 0) │  │ 2. Deterministic      │ │
│  │ - TopMetricStrip (3 KPI Cards via useMemo)   │  │    Preset + Regex     │ │
│  │ - ProportionBar (Stacked % Bar)              │  │    Fallback Parser    │ │
│  │ - CategoryLedger (Locked Essential rows +    │  └───────────────────────┘ │
│  │   0%–150% Sliders on Flexible & Want rows)   │                            │
│  │ - ActionPlanBar (Copy Markdown + Reset)      │                            │
│  └──────────────────────────────────────────────┘                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

1. **Arrive & Hydrate (`prd.md > The Core Journey`, Step 1):** On mount, the client reads `localStorage.getItem("pulse_ledger_state")` and validates it against `BudgetLedgerStateSchema`. If valid saved state exists, the dashboard renders immediately; otherwise, the Left Column shows an empty textarea with **Analyze Cashflow** disabled and the Right Column renders the **Ready to Analyze** empty-state panel.
2. **Input or Select Preset (`prd.md > The Core Journey`, Step 2):** Clicking a preset pill (**Post-Payday Squeeze**, **Freelancer Month**, or **Shop & Side-Hustle**) or typing into the textarea updates `rawInput` and enables **Analyze Cashflow**.
3. **Parse & Validate (`prd.md > The Core Journey`, Step 3):** Clicking **Analyze Cashflow** sends `POST /api/parse-budget` with `{ rawInput }`. The API route validates input with `ParseBudgetRequestSchema`, attempts OpenRouter extraction if `OPENROUTER_API_KEY` is set, and falls back to `parseWithFallback(rawInput)` on missing key, timeout, or schema error. All returned items have `sliderPercent` initialized to `100` and `simulatedAmount = baselineAmount`.
4. **Render Top Metrics & Proportion Bar (`prd.md > The Core Journey`, Step 4):** The client stores the validated `BudgetLedgerState` in React state (and persists it to `"pulse_ledger_state"`). A `useMemo` selector (`computeDerivedMetrics`) computes baseline totals, simulated totals, 30-day **Safe Daily Allowance** vs. **Actual Daily Spend**, **Largest Leak Category**, **Annualized Savings Projection**, and stacked bar percentages.
5. **Scrub What-If Sliders (`prd.md > The Core Journey`, Step 5):** Dragging a slider on any `"flexible"` or `"want"` row (`0%` to `150%`, step `5%`) calls `updateItemSlider(itemId, newPercent)`, which updates `sliderPercent` and `simulatedAmount = Math.round((baselineAmount * sliderPercent) / 100)`. All metric cards, semantic traffic-light badges (`emerald` / `amber` / `rose`), category headers, and the proportion bar update synchronously in the same render frame. `"essential"` rows never render a slider and stay locked at `100%`.
6. **Reset or Copy Action Plan (`prd.md > The Core Journey`, Step 6):** Clicking **Reset Sliders** snaps all `"flexible"` and `"want"` items back to `sliderPercent = 100`. Clicking **Copy Action Plan** builds the 5-part Markdown string via `formatActionPlanMarkdown(state, metrics)`, writes it to `navigator.clipboard.writeText()`, and flips the button state to `"Copied!"` for 2 seconds.

---

## Stack

- **Framework:** [Next.js 15+ (App Router)](https://nextjs.org/docs/app) with [React 19](https://react.dev/reference/react) (`useState`, `useMemo`, `useEffect`).
  - *Rationale & Tradeoff:* Learner's established full-stack framework; provides colocated client UI and `POST /api/parse-budget` route handler in one project without running a separate backend server.
- **Language:** [TypeScript 5+ (`strict: true`)](https://www.typescriptlang.org/tsconfig/#strict).
  - *Rationale & Tradeoff:* Enforces compile-time safety from Zod-inferred types across API routes, calculation helpers, and UI props.
- **Schema & Validation:** [Zod 3+](https://zod.dev/).
  - *Rationale & Tradeoff:* Single source of truth for request payloads, OpenRouter JSON output validation, and `localStorage` state hydration.
- **Styling & UI Primitives:** [Tailwind CSS v3/v4](https://tailwindcss.com/docs), [shadcn/ui](https://ui.shadcn.com/docs) primitives (`Card`, `Slider`, `Badge`, `Button`, `Textarea` backed by [@radix-ui/react-slider](https://www.radix-ui.com/primitives/docs/components/slider)), and [Lucide React](https://lucide.dev/guide/packages/lucide-react) icons.
  - *Rationale & Tradeoff:* Delivers accessible keyboard/pointer range sliders and crisp dark-mode fintech styling without custom slider math.
- **Typography:** [Geist Sans & Geist Mono](https://vercel.com/font) (via `next/font/google` fallback to `Inter` and `JetBrains Mono`) with Tailwind `tabular-nums`.
  - *Rationale & Tradeoff:* Prevents horizontal number jitter when scrubbing What-If sliders in real time.
- **LLM Gateway (Optional Live Path):** [OpenRouter Chat Completions API](https://openrouter.ai/docs/api-reference/chat-completion) via native Node `fetch` (`https://openrouter.ai/api/v1/chat/completions`).
  - *Rationale & Tradeoff:* Lets the learner use a single `OPENROUTER_API_KEY` and switch models via `OPENROUTER_MODEL` (default `"openai/gpt-4o-mini"`, or `"google/gemini-2.5-flash"`) with zero vendor SDK dependencies.

> **Build-Time Verification Note:** Exact installed major versions of `next`, `tailwindcss`, and `zod` will be verified when scaffolding `package.json` in Step 1 of `5-build`.

---

## Where It Runs and How Someone Tries It

- **Primary Runtime:** Local Node.js (`v20+`) development server running in the browser at `http://localhost:3000`.
- **Environment Variables (`.env.local` — Optional):**
  ```bash
  # Optional: If omitted, PulseLedger automatically uses the deterministic local parser
  OPENROUTER_API_KEY=sk-or-v1-...
  OPENROUTER_MODEL=openai/gpt-4o-mini
  ```
- **How to Start Locally (and Record the Demo):**
  ```bash
  npm install
  npm run dev
  # Open http://localhost:3000 in any modern browser
  ```
- **Demo Recording Flow:** Open `http://localhost:3000`, click the **Post-Payday Squeeze** preset pill, click **Analyze Cashflow**, drag two non-fixed sliders down to watch the **Safe Daily Allowance vs. Actual Daily Spend** badge flip from `Rose` to `Emerald` alongside the 1-year projected savings callout, and click **Copy Action Plan**.
- **Hackathon Submission Requirement:** Submission requires **both a short demo video and a public GitHub repository**. Deployment is optional and does not replace the demo video.
- **Demo Video URL:** `https://youtu.be/GAlJvhhSYqo`
- **Public GitHub Repository:** `https://github.com/jeio-dev/pulse-ledger`
- **Optional Deployment Target (`6-ship`):** [Vercel](https://vercel.com/docs) (import the public GitHub repository, optionally add `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in Project Settings -> Environment Variables, and deploy with default Next.js settings; even without env vars configured on Vercel, the deterministic fallback parser keeps the live URL 100% functional).

---

## Look and Feel

Implements `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

- **Aesthetic & References:** High-contrast dark fintech ledger inspired by Linear (`https://linear.app`) and Stripe (`https://stripe.com`) dark dashboards.
- **Surface Palette (Tailwind Tokens):**
  - App Background Canvas: `bg-slate-950 text-slate-100`
  - Panel & Card Surfaces: `bg-slate-900/90 border border-slate-800 rounded-xl`
  - Subtle Row Hover & Dividers: `divide-slate-800/80 hover:bg-slate-900/60`
- **Typography & Numeric Alignment:**
  - UI headings, category titles, and AI tips: `font-sans` (`Geist Sans` / `Inter`).
  - All currency figures, percentages, daily rates, and deltas: `font-mono tabular-nums tracking-tight` (`Geist Mono` / `JetBrains Mono`) so digits never shift horizontally during 60fps slider drags.
- **Semantic Traffic-Light Tokens:**
  - **Emerald (Healthy Surplus / Safe Daily Burn):** `bg-emerald-500/10 text-emerald-400 border-emerald-500/30` (Surplus `>= 10%` of monthly income; `simulatedDailySpend <= safeDailyAllowance`).
  - **Amber (Tight Margin):** `bg-amber-500/10 text-amber-400 border-amber-500/30` (Surplus `0%` to `< 10%` of monthly income).
  - **Rose (Deficit / Daily Overspend):** `bg-rose-500/10 text-rose-400 border-rose-500/30` (Surplus `< $0`; `simulatedDailySpend > safeDailyAllowance`).
- **Category Bucket Accent Colors (Proportion Bar & Badges):**
  - `Fixed Essentials ("essential")`: `bg-slate-500` / `text-slate-300` (with Lock icon badge).
  - `Flexible Living ("flexible")`: `bg-sky-500` / `text-sky-400`.
  - `Discretionary Wants ("want")`: `bg-violet-500` / `text-violet-400`.
  - `Remaining Surplus`: `bg-emerald-500` (or `bg-rose-500` striped/highlighted indicator when in deficit).

---

## Components

### 1. Workspace Shell & State Container (`src/app/page.tsx`)
- **What it does:** Renders the top header bar and the single-screen responsive two-column grid (`grid-cols-1 lg:grid-cols-12 gap-6`), holds `BudgetLedgerState` in React state, hydrates/syncs `"pulse_ledger_state"` in `localStorage`, and computes `DerivedCashflowMetrics` via `useMemo`.
- **What it talks to:** Passes state and handlers down to `InputPanel`, `ExpenseOnlyBanner`, `TopMetricStrip`, `ProportionBar`, `CategoryLedger`, and `ActionPlanBar`.
- **PRD ref:** Implements `prd.md > Screens and Layout`, `prd.md > 5. Copy Action Plan & Workspace Persistence`, and `prd.md > States and Boundaries`.

### 2. Brain-Dump Input Panel & Preset Strip (`src/components/InputPanel.tsx`)
- **What it does:** Renders the Left Column (`lg:col-span-4`) containing the 3 preset scenario pills (**Post-Payday Squeeze**, **Freelancer Month**, **Shop & Side-Hustle**), the plain-English multiline `Textarea`, inline validation/unparseable feedback, the primary **Analyze Cashflow** button (disabled when `rawInput.trim().length === 0` or while loading), and the secondary **Clear All** button.
- **What it talks to:** Reads preset strings from `src/lib/presets.ts`; invokes `onAnalyze(rawInput)` (which calls `POST /api/parse-budget`) and `onClearAll()`.
- **PRD ref:** Implements `prd.md > 1. Brain-Dump Input, Presets, and Resilient Parsing` and `prd.md > States and Boundaries` (First Use / Empty Workspace State & Unparseable Input State).

### 3. Cashflow Parser API Route & Deterministic Fallback Engine (`src/app/api/parse-budget/route.ts` & `src/lib/fallback-parser.ts`)
- **What it does:**
  1. Validates `{ rawInput }` using `ParseBudgetRequestSchema`.
  2. Checks if `rawInput` contains any recognizable numeric currency values; if none exist, returns HTTP `422` with a clear message so the UI triggers the **Unparseable Input State**.
  3. If ` process.env.OPENROUTER_API_KEY` is present, sends a `POST` request to `https://openrouter.ai/api/v1/chat/completions` (`AbortSignal.timeout(6000)`) instructing the model to extract `monthlyIncome`, `currencySymbol`, and categorized `items` (`"essential" | "flexible" | "want"`) with concise 1-line `aiTip` strings, then validates the parsed JSON with `BudgetResponseSchema`.
  4. If `OPENROUTER_API_KEY` is absent, or if the fetch times out, errors, or fails Zod validation, runs `parseWithFallback(rawInput)` from `src/lib/fallback-parser.ts` and tags the response with `parserSource: "fallback"` so the UI displays a subtle non-blocking `Fallback Parser` badge.
- **What it talks to:** OpenRouter REST API (external, optional) and `src/lib/schemas.ts`.
- **PRD ref:** Implements `prd.md > 1. Brain-Dump Input, Presets, and Resilient Parsing` and `prd.md > States and Boundaries` (Fallback Parser State & Unparseable Input State).

### 4. Expense-Only Breakdown Banner (`src/components/ExpenseOnlyBanner.tsx`)
- **What it does:** Renders conditionally at the top of the Right Column when an analyzed ledger has `items.length > 0` and `monthlyIncome === 0` (`isExpenseOnlyMode: true`). Explains that no monthly income was detected in the text and provides an inline numeric input + **Apply Income** action to set `monthlyIncome` immediately without re-running the parser.
- **What it talks to:** Calls `onUpdateMonthlyIncome(amount)` on the parent workspace state.
- **PRD ref:** Implements `prd.md > Screens and Layout` (Conditional Top Banner) and `prd.md > States and Boundaries` (Expense-Only Breakdown Mode).

### 5. Top Metric Strip & Cashflow Formula Engine (`src/components/TopMetricStrip.tsx` & `src/lib/calculations.ts`)
- **What it does:** Pure calculation module (`computeDerivedMetrics`) and 3-card KPI strip:
  - **Card 1 — Monthly Surplus / Deficit:** Shows `simulatedSurplus` (`+$/mo` or `-$/mo`), comparison to `baselineSurplus`, and semantic traffic-light badge (`Emerald` `>= 10%` of income, `Amber` `0%` to `< 10%`, `Rose` `< $0`).
  - **Card 2 — Safe Daily Allowance vs. Actual Daily Spend:** Shows 30-day `safeDailyAllowance` vs. `simulatedDailySpend`, daily buffer/overspend delta (`dailyDelta`), and `Emerald` (`simulatedDailySpend <= safeDailyAllowance`) or `Rose` (`simulatedDailySpend > safeDailyAllowance`) badge.
  - **Card 3 — Largest Leak & 1-Year Impact:** Highlights whichever adjustable category (`Flexible Living` vs. `Discretionary Wants`) has the higher current simulated spend (`largestLeakCategory` + dollar total) at the top, paired with **Annualized Savings Projection** (`annualizedSavings = Math.max(0, (baselineTotalSpend - simulatedTotalSpend) * 12)`) below.
- **What it talks to:** Consumes `DerivedCashflowMetrics` computed via `useMemo` in `src/app/page.tsx`.
- **PRD ref:** Implements `prd.md > 2. Top Metric Strip & Cashflow Formulas`.

### 6. Visual Proportion Bar (`src/components/ProportionBar.tsx`)
- **What it does:** Renders a horizontal stacked percentage bar and color-coded legend for `Fixed Essentials`, `Flexible Living`, `Discretionary Wants`, and `Remaining Surplus`. When `simulatedTotalSpend <= monthlyIncome` (and `monthlyIncome > 0`), segment widths are percentages of `monthlyIncome`. When in deficit (`simulatedTotalSpend > monthlyIncome`) or in Expense-Only mode (`monthlyIncome === 0`), segment widths represent each bucket's percentage of `simulatedTotalSpend` with a rose deficit indicator badge.
- **What it talks to:** Consumes `DerivedCashflowMetrics`.
- **PRD ref:** Implements `prd.md > 3. Visual Proportion Bar`.

### 7. Interactive What-If Category Ledger & Slider Rows (`src/components/CategoryLedger.tsx`)
- **What it does:** Renders the 3 category groups (`Fixed Essentials`, `Flexible Living`, `Discretionary Wants`) with live category subtotals (`$`) and a **Reset Sliders** button in the ledger header:
  - **Locked `Fixed Essentials` (`"essential"`) rows:** Read-only terminal-style row showing `label`, `Locked` badge with lock icon, and `baselineAmount` (`$`). Never renders a slider.
  - **Adjustable `Flexible Living` (`"flexible"`) & `Discretionary Wants` (`"want"`) rows:** Interactive row showing `label`, muted `baselineAmount`, bold `simulatedAmount`, percentage & dollar delta badge (e.g., `70% (-$60)`), a shadcn/Radix `Slider` (`min={0}`, `max={150}`, `step={5}`), and the 1-line `aiTip` underneath.
- **What it talks to:** Calls `onSliderChange(itemId, sliderPercent)` and `onResetSliders()`.
- **PRD ref:** Implements `prd.md > 4. Interactive What-If Category Ledger & Sliders`.

### 8. Action Plan Markdown Exporter (`src/components/ActionPlanBar.tsx` & `src/lib/markdown-export.ts`)
- **What it does:** Renders the bottom action bar with a summary of active cuts and the primary **Copy Action Plan** button. Clicking **Copy Action Plan** generates the 5-part Markdown document (`# PulseLedger Monthly Action Plan` with Cashflow Summary, Daily Pace, 1-Year Impact, and `- [ ]` Actionable Cuts Checklist for all items where `sliderPercent < 100`), writes it to the clipboard, and shows a `"Copied!"` confirmation state for 2 seconds.
- **What it talks to:** Consumes `BudgetLedgerState` and `DerivedCashflowMetrics`.
- **PRD ref:** Implements `prd.md > 5. Copy Action Plan & Workspace Persistence`.

---

## Data Model

All schemas live in `src/lib/schemas.ts` and act as the single contract across the API route, fallback parser, `localStorage` persistence, and UI components.

```typescript
import { z } from "zod";

export const ExpenseCategorySchema = z.enum(["essential", "flexible", "want"]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const ExpenseItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: ExpenseCategorySchema,
  baselineAmount: z.number().nonnegative(),
  sliderPercent: z.number().min(0).max(150), // Locked at 100 for "essential"
  simulatedAmount: z.number().nonnegative(), // Math.round((baselineAmount * sliderPercent) / 100)
  aiTip: z.string(),
});
export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;

export const ParseBudgetRequestSchema = z.object({
  rawInput: z.string().trim().min(1, "Please enter your monthly income and expenses."),
});

export const BudgetResponseSchema = z.object({
  monthlyIncome: z.number().nonnegative(),
  currencySymbol: z.string().default("$"),
  parserSource: z.enum(["ai", "fallback"]).default("fallback"),
  items: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      category: ExpenseCategorySchema,
      baselineAmount: z.number().nonnegative(),
      aiTip: z.string().default(""),
    })
  ).min(1),
});
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;

export const BudgetLedgerStateSchema = z.object({
  rawInput: z.string(),
  monthlyIncome: z.number().nonnegative(),
  currencySymbol: z.string().default("$"),
  parserSource: z.enum(["ai", "fallback"]).default("fallback"),
  items: z.array(ExpenseItemSchema),
});
export type BudgetLedgerState = z.infer<typeof BudgetLedgerStateSchema>;
```

### Synchronization Rule (`baselineAmount` + `sliderPercent` -> `simulatedAmount`)
To guarantee `simulatedAmount` never drifts during `localStorage` hydration or slider scrubbing, `src/lib/calculations.ts` exposes a single normalization helper used both when hydrating state and when updating any slider:

```typescript
export function computeSimulatedAmount(
  category: ExpenseCategory,
  baselineAmount: number,
  sliderPercent: number
): { sliderPercent: number; simulatedAmount: number } {
  const effectivePercent = category === "essential" ? 100 : Math.min(150, Math.max(0, sliderPercent));
  return {
    sliderPercent: effectivePercent,
    simulatedAmount: Math.round((baselineAmount * effectivePercent) / 100),
  };
}
```

### Derived Metrics Shape (`src/lib/calculations.ts`)
Computed synchronously via `useMemo` from `BudgetLedgerState`:
- **Baseline Totals:**
  - `baselineEssential`, `baselineFlexible`, `baselineWant` = sum of `baselineAmount` per category
  - `baselineTotalSpend = baselineEssential + baselineFlexible + baselineWant`
  - `baselineSurplus = monthlyIncome - baselineTotalSpend`
- **Simulated Totals:**
  - `simulatedEssential = baselineEssential` (strictly locked at `100%`)
  - `simulatedFlexible` = sum of `simulatedAmount` for `"flexible"`
  - `simulatedWant` = sum of `simulatedAmount` for `"want"`
  - `simulatedTotalSpend = simulatedEssential + simulatedFlexible + simulatedWant`
  - `simulatedSurplus = monthlyIncome - simulatedTotalSpend`
- **30-Day Daily Burn Metrics:**
  - `safeDailyAllowance = Math.max(0, (monthlyIncome - simulatedEssential) / 30)`
  - `simulatedDailySpend = (simulatedFlexible + simulatedWant) / 30`
  - `dailyDelta = safeDailyAllowance - simulatedDailySpend`
- **Leak & 1-Year Impact Metrics:**
  - `largestLeakCategory`: compares `simulatedWant` (`"Discretionary Wants"`) vs. `simulatedFlexible` (`"Flexible Living"`) and returns the higher-spend bucket label and amount.
  - `monthlySaved = baselineTotalSpend - simulatedTotalSpend`
  - `annualizedSavings = Math.max(0, monthlySaved * 12)`
- **Mode Flags:**
  - `isExpenseOnlyMode = items.length > 0 && monthlyIncome === 0`

### State Lifecycle (Where Data Lives)
| Data | Origin | Storage Location | How It Updates | On Browser Reload / Return |
|---|---|---|---|---|
| `rawInput` | User typing or preset pill click | React state + `localStorage["pulse_ledger_state"]` | Textarea `onChange` / preset click / `Clear All` | Restored from `localStorage` if a workspace is saved |
| `monthlyIncome` & `items` (with `sliderPercent` & `simulatedAmount`) | `POST /api/parse-budget` response | React state + `localStorage["pulse_ledger_state"]` | Analyzing text, scrubbing sliders, clicking `Reset Sliders`, inline income banner edit, or `Clear All` | Validated via `BudgetLedgerStateSchema.safeParse` and normalized via `computeSimulatedAmount` on mount |
| `DerivedCashflowMetrics` | Calculated from `BudgetLedgerState` | In-memory via `useMemo` (never duplicated in storage) | Automatically recalculates on every state update | Recomputed immediately after `localStorage` hydration |

---

## File Structure

```
pulse-ledger/
├── devpost/
│   ├── learner-profile.md          # Learner background & workflow goals
│   ├── scope.md                    # Approved PoC scope
│   ├── prd.md                      # Approved product requirements
│   └── spec.md                     # This technical specification
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── parse-budget/
│   │   │       └── route.ts        # POST handler: Zod validation + OpenRouter fetch + fallback parser
│   │   ├── globals.css             # Tailwind directives + dark fintech scrollbar/tabular styles
│   │   ├── layout.tsx              # Root layout with Geist Sans & Geist Mono fonts + dark theme
│   │   └── page.tsx                # Single-screen workspace shell, state, localStorage sync
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (button, card, badge, slider, textarea)
│   │   ├── InputPanel.tsx          # Left Column: 3 preset pills, textarea, Analyze & Clear All
│   │   ├── ReadyEmptyState.tsx     # Right Column initial empty state before first analysis
│   │   ├── ExpenseOnlyBanner.tsx   # Conditional inline monthly income input when income === 0
│   │   ├── TopMetricStrip.tsx      # 3 live KPI cards (Surplus/Deficit, Safe vs Actual Daily, Leak & 1-Yr)
│   │   ├── ProportionBar.tsx       # Horizontal stacked percentage bar + legend
│   │   ├── CategoryLedger.tsx      # 3 category sections, locked essential rows, 0%–150% slider rows
│   │   └── ActionPlanBar.tsx       # Bottom bar with Reset Sliders & Copy Action Plan + toast state
│   └── lib/
│       ├── schemas.ts              # Zod schemas & TypeScript types (single source of truth)
│       ├── presets.ts              # 3 preset scenario texts + pre-mapped baseline parse payloads
│       ├── fallback-parser.ts      # Deterministic preset matcher + regex/keyword clause parser
│       ├── calculations.ts         # Pure 30-day cashflow formulas, status badge logic, normalization
│       ├── markdown-export.ts      # 5-part Markdown generator for Copy Action Plan
│       └── utils.ts                # Tailwind `cn()` helper and currency/number formatters
├── .env.example                    # Example OPENROUTER_API_KEY and OPENROUTER_MODEL configuration
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## External Services and Dependencies

### OpenRouter Chat Completions API (Optional — Automatic Local Fallback)
- **Documentation:** [https://openrouter.ai/docs/api-reference/chat-completion](https://openrouter.ai/docs/api-reference/chat-completion)
- **Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions`
- **Authentication:** `Authorization: Bearer ${process.env.OPENROUTER_API_KEY}`
- **Model Selection:** `process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"` (compatible with `"google/gemini-2.5-flash"` or any JSON-capable model on OpenRouter).
- **Timeout & Resilience:** `AbortSignal.timeout(6000)` (6 seconds).
- **Request Payload:**
  ```json
  {
    "model": "openai/gpt-4o-mini",
    "response_format": { "type": "json_object" },
    "temperature": 0.1,
    "messages": [
      {
        "role": "system",
        "content": "Extract monthly cashflow into strict JSON matching: { \"monthlyIncome\": number, \"currencySymbol\": \"$\", \"items\": [{ \"id\": string, \"label\": string, \"category\": \"essential\" | \"flexible\" | \"want\", \"baselineAmount\": number, \"aiTip\": string }] }. Classify fixed obligations (rent, mortgage, utilities, insurance, minimum debt, transit pass) as \"essential\", variable necessities (groceries, gas, rideshares, household supplies) as \"flexible\", and lifestyle/dining/subscriptions/shopping as \"want\". If no income is mentioned, set monthlyIncome to 0."
      },
      {
        "role": "user",
        "content": "<rawInput>"
      }
    ]
  }
  ```
- **Response Validation:** Extracted `choices[0].message.content` is parsed with `JSON.parse` and validated via `BudgetResponseSchema.safeParse()`. If validation passes, `parserSource` is set to `"ai"`. If the key is missing, the HTTP call fails/times out, or Zod validation fails, the route immediately returns the deterministic output of `parseWithFallback(rawInput)` with `parserSource: "fallback"`.
- **Cost & Rate Limits:** Fractions of a cent per parse with `openai/gpt-4o-mini` or `google/gemini-2.5-flash`; zero cost when running in deterministic fallback mode.

---

## Important Failure Modes

1. **Missing `OPENROUTER_API_KEY`, Network Offline, Rate Limit, or Malformed LLM JSON** → `POST /api/parse-budget` catches the error or timeout after 6 seconds and executes `parseWithFallback(rawInput)`. The user gets structured categories and saving tips immediately alongside a subtle `Fallback Parser` badge in the dashboard header—never an unhandled error modal.
2. **Brain-Dump Contains Expenses Only (`monthlyIncome === 0`)** → `ExpenseOnlyBanner` renders at the top of the Right Column with a quick inline numeric input so the user can enter their monthly income and immediately unlock Surplus/Deficit and Safe Daily Allowance calculations without re-parsing.
3. **Unparseable Input (Zero Dollar/Currency Figures in Text)** → `POST /api/parse-budget` returns HTTP `422` (`"No dollar amounts detected. Include numbers like '$2,600 income, $1,150 rent' or click a preset pill above."`), and `InputPanel` displays the inline hint while preserving the user's text.
4. **Corrupted or Outdated `localStorage["pulse_ledger_state"]` Entry** → On mount, if `JSON.parse` or `BudgetLedgerStateSchema.safeParse` fails, the invalid entry is removed from `localStorage` and the app cleanly boots into the **Ready to Analyze** empty state.

---

## What Was Simplified and Why

- **Browser `localStorage` (`"pulse_ledger_state"`) instead of a hosted database and user auth** — Preserves the 60-second brain-dump-to-What-If experience with zero login wall or external DB setup (`scope.md > Explicitly Cut`). A fuller version would add user accounts and multi-month historical tables.
- **Native `fetch` to OpenRouter + deterministic local fallback instead of a heavy multi-agent SDK** — Keeps dependencies minimal, works across any OpenRouter model with one API key, and guarantees 100% offline/demo reliability when no key is configured.
- **Locked `Fixed Essentials` (`sliderPercent: 100`) vs. Adjustable `Flexible Living` & `Discretionary Wants` (`0%–150%`)** — Rent and fixed obligations cannot realistically be dialed down mid-month; locking them keeps `Safe Daily Allowance = (Monthly Income - Fixed Essentials) / 30` realistic and focused on controllable daily burn.
- **3 hardcoded realistic presets instead of custom saved user templates** — Lets evaluators test three distinct cashflow archetypes in one click without building template CRUD UI (`prd.md > Deferred From the POC`).

---

## Decisions and Open Issues

### Agreed Architectural Decisions
- **Learner Decision — OpenRouter via Native `fetch` + Zod Validation:** Use `https://openrouter.ai/api/v1/chat/completions` with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` (default `"openai/gpt-4o-mini"`), `response_format: { type: "json_object" }`, a 6-second timeout, and `BudgetResponseSchema` validation before dropping to the deterministic fallback parser. *Tradeoff accepted:* Requires manual JSON parsing of `choices[0].message.content` rather than an SDK wrapper, which is cleanly handled by `BudgetResponseSchema.safeParse`.
- **Learner Decision — Single Unified `BudgetLedgerState` in `localStorage`:** Store `sliderPercent` (`0–150`, step `5`) and `simulatedAmount` directly on each `ExpenseItem` inside `"pulse_ledger_state"`, while computing all rollups, daily burn metrics, and Markdown export text via `useMemo`.
- **Learner Decision — Local Node 20+ Runtime with Optional Vercel Deploy:** Primary development and demo recording run locally via `npm run dev` on `http://localhost:3000`, with Vercel documented as an optional zero-config deployment target for `6-ship`.

### Build-Time Scrutiny Items (Learner Uncertainties / Edge Alignment to Verify in `5-build`)
1. **Deterministic Fallback Clause Separation (`src/lib/fallback-parser.ts`):** When parsing custom free-form sentences outside the 3 built-in presets, the regex/keyword parser must cleanly distinguish income clauses (`income`, `salary`, `paid`, `take-home`, `freelance`, `side-hustle`, `earn`, `make`) from expense clauses, and deterministically classify expense keywords into `"essential"` (rent, mortgage, utilities, electric, water, internet, phone, insurance, loan, tuition, transit pass), `"flexible"` (groceries, supermarket, gas, fuel, uber, lyft, rideshare, household, pharmacy, supplies), and `"want"` (dining, restaurants, takeout, coffee, cafe, snacks, bars, subscriptions, streaming, shopping, impulse, gear, upgrades, entertainment) with a tailored default `aiTip` per keyword group. *Verification in `5-build`:* Test custom multi-clause sentences with both income and mixed expenses in fallback mode.
2. **Single-Source-of-Truth Normalization for `simulatedAmount` (`src/lib/calculations.ts`):** Because `ExpenseItem` includes both `sliderPercent` and `simulatedAmount`, hydrating from `localStorage` or updating sliders could risk stale amounts if updated separately. *Verification in `5-build`:* Route all parse outputs, `localStorage` hydrations, slider drags, and `Reset Sliders` actions through `computeSimulatedAmount(category, baselineAmount, sliderPercent)` so `"essential"` items are always clamped to `100%` and `simulatedAmount` always equals `Math.round((baselineAmount * sliderPercent) / 100)`.

### Open Issues
- None blocking `5-build`. All PRD features (`1` through `5`), states, formulas, and schemas have a concrete home in the file tree.
