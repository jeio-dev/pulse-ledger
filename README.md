# PulseLedger

Single-screen personal cashflow parser and What-If expense simulator built with Next.js, TypeScript, Tailwind CSS, and Zod.

## Local Setup & Run Instructions

### Prerequisites
- Node.js `v20+`
- `npm`

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env.local` if you want to enable live LLM extraction via OpenRouter:

```bash
cp .env.example .env.local
```

```env
# Optional: If omitted, PulseLedger automatically uses the deterministic local fallback parser
OPENROUTER_API_KEY=sk-or-v1-your-placeholder-key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

If `OPENROUTER_API_KEY` is omitted or unreachable, the app automatically falls back to its built-in deterministic parser (`src/lib/fallback-parser.ts`).

### 3. Start the Development Server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Production Build Verification
```bash
npm run build
npm start
```

## Planning & Architecture Artifacts
- [`devpost/scope.md`](devpost/scope.md) — Proof-of-concept scope and boundary
- [`devpost/prd.md`](devpost/prd.md) — Product requirements and core journey
- [`devpost/spec.md`](devpost/spec.md) — Technical specification and data model
- [`devpost/checklist.md`](devpost/checklist.md) — Vertical build slices and verification log
- [`devpost/app-map.html`](devpost/app-map.html) — Interactive architecture and data-flow map
