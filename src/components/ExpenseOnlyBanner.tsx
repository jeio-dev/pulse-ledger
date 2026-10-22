"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseOnlyBannerProps {
  currencySymbol: string;
  onUpdateMonthlyIncome: (income: number) => void;
}

export function ExpenseOnlyBanner({
  currencySymbol,
  onUpdateMonthlyIncome,
}: ExpenseOnlyBannerProps) {
  const [incomeDraft, setIncomeDraft] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = incomeDraft.replace(/[^0-9.]/g, "");
    const parsed = Math.round(parseFloat(cleaned));
    if (!Number.isNaN(parsed) && parsed > 0) {
      onUpdateMonthlyIncome(parsed);
      setIncomeDraft("");
    }
  };

  return (
    <div className="relative flex flex-col justify-between gap-3 border border-status-caution/60 bg-paper-sheet p-4 sm:flex-row sm:items-center">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] bg-status-caution"
      />
      <div className="pl-2">
        <div className="type-micro-label text-status-caution">
          NOTICE // EXPENSE-ONLY STATEMENT MODE (NO MONTHLY INCOME DETECTED)
        </div>
        <p className="mt-1 text-[13px] leading-[1.45] text-ink-secondary">
          Expense buckets and What-If savings cuts are active. Enter monthly net take-home pay to compute Safe Daily Allowance:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0 pl-2 sm:pl-0">
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-muted">
            {currencySymbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={incomeDraft}
            onChange={(e) => setIncomeDraft(e.target.value)}
            placeholder="3,200"
            aria-label="Monthly income amount"
            className="h-8 w-28 rounded-none border border-rule-hairline bg-paper-base pl-6 pr-2.5 font-mono text-xs tabular-nums text-ink-primary placeholder:text-ink-muted focus:border-accent-primary focus:outline-none"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!incomeDraft.trim()}
          className="h-8"
        >
          SET INCOME
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
