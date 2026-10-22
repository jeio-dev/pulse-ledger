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
      aria-label="Action Plan Sign-Off Bar"
      className="border border-rule-hairline bg-paper-sheet"
    >
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <div className="type-micro-label text-ink-muted">
            SEC 04 // STATEMENT SIGN-OFF &amp; MARKDOWN EXPORT
          </div>
          <h3 className="type-bucket-title mt-0.5 text-ink-primary">
            Action Plan Dispatch
          </h3>
          <p className="mt-1 font-mono text-xs tabular-nums text-ink-secondary">
            {cutCount > 0 ? (
              <>
                <span className="font-semibold text-accent-primary">
                  {cutCount} TARGET {cutCount === 1 ? "CUT" : "CUTS"}
                </span>{" "}
                RECOVERING{" "}
                <span className="font-semibold text-accent-primary">
                  {formatCurrency(
                    Math.max(0, metrics.monthlySaved),
                    ledger.currencySymbol
                  )}
                  /MO
                </span>{" "}
                (
                {formatCurrency(
                  metrics.annualizedSavings,
                  ledger.currencySymbol
                )}
                /YR PROJECTED)
              </>
            ) : (
              "SCRUB ANY FLEXIBLE OR WANT ROW BELOW 100% TO COMPILE TARGET CUTS."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onResetSliders}
            disabled={metrics.adjustedItemsCount === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESET SLIDERS
          </Button>

          <Button
            type="button"
            onClick={handleCopyActionPlan}
            className="min-w-[180px]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                COPIED TO CLIPBOARD
              </>
            ) : (
              <>
                <ClipboardCopy className="h-3.5 w-3.5" />
                COPY ACTION PLAN
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
