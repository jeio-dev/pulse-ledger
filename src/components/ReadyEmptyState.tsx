import * as React from "react";
import { SlidersHorizontal } from "lucide-react";

export function ReadyEmptyState() {
  return (
    <section
      aria-label="Ready to Analyze"
      className="flex min-h-[380px] flex-col items-center justify-center border border-rule-hairline bg-paper-sheet p-8 text-center"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center border border-rule-hairline bg-paper-base text-accent-primary">
        <SlidersHorizontal className="h-4 w-4" />
      </div>

      <h2 className="font-display text-lg font-semibold text-ink-primary">
        Ready to Analyze
      </h2>

      <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">
        Paste your monthly income and expenses on the left, or pick a preset to simulate your 30-day cashflow.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-ink-muted">
        <span className="border border-rule-hairline bg-paper-base px-2.5 py-1">
          1. Paste summary
        </span>
        <span>→</span>
        <span className="border border-rule-hairline bg-paper-base px-2.5 py-1">
          2. Check daily allowance
        </span>
        <span>→</span>
        <span className="border border-rule-hairline bg-paper-base px-2.5 py-1">
          3. Drag What-If sliders
        </span>
      </div>
    </section>
  );
}
