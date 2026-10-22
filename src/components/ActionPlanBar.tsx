"use client";

import * as React from "react";
import { Check, ClipboardCopy, RotateCcw, Sparkles } from "lucide-react";
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
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-100">
            Action Plan Summary
          </span>
        </div>
        <p className="font-mono text-xs tabular-nums text-slate-400">
          {cutCount > 0 ? (
            <>
              <span className="font-semibold text-emerald-400">
                {cutCount} target {cutCount === 1 ? "cut" : "cuts"}
              </span>{" "}
              saving{" "}
              <span className="font-semibold text-emerald-400">
                {formatCurrency(
                  Math.max(0, metrics.monthlySaved),
                  ledger.currencySymbol
                )}
                /mo
              </span>{" "}
              (
              {formatCurrency(
                metrics.annualizedSavings,
                ledger.currencySymbol
              )}
              /yr)
            </>
          ) : (
            "Drag any Flexible or Want slider below 100% to build your monthly cut checklist."
          )}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onResetSliders}
          disabled={metrics.adjustedItemsCount === 0}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Sliders
        </Button>

        <Button
          type="button"
          onClick={handleCopyActionPlan}
          className="min-w-[165px]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardCopy className="h-4 w-4" />
              Copy Action Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
