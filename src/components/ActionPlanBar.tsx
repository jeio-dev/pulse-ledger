"use client";

import * as React from "react";
import { Check, ClipboardCopy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DerivedCashflowMetrics } from "@/lib/calculations";
import { formatActionPlanMarkdown } from "@/lib/markdown-export";
import type { BudgetLedgerState } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";

interface ActionPlanBarProps {
  ledger: BudgetLedgerState;
  metrics: DerivedCashflowMetrics;
  onResetSliders: () => void;
}

export function ActionPlanBar({
  ledger,
  metrics,
  onResetSliders,
}: ActionPlanBarProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopyActionPlan = async () => {
    const markdown = formatActionPlanMarkdown(ledger, metrics);

    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const cutCount = ledger.items.filter(
    (i) => i.category !== "essential" && i.sliderPercent < 100
  ).length;

  return (
    <section
      aria-label="Action Plan Export"
      className="flex flex-col justify-between gap-3 border border-rule-hairline bg-paper-sheet p-4 sm:flex-row sm:items-center"
    >
      <p className="font-mono text-xs tabular-nums text-ink-secondary">
        {cutCount > 0 ? (
          <>
            <span className="font-semibold text-accent-primary">
              {cutCount} {cutCount === 1 ? "cut" : "cuts"}
            </span>{" "}
            saving{" "}
            <span className="font-semibold text-accent-primary">
              {formatCurrency(
                Math.max(0, metrics.monthlySaved),
                ledger.currencySymbol
              )}
              /mo
            </span>{" "}
            (
            {formatCurrency(metrics.annualizedSavings, ledger.currencySymbol)}
            /yr)
          </>
        ) : (
          "Adjust sliders above to build your action plan."
        )}
      </p>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetSliders}
          disabled={metrics.adjustedItemsCount === 0}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleCopyActionPlan}
          className="min-w-[150px]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardCopy className="h-3.5 w-3.5" />
              Copy Action Plan
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
