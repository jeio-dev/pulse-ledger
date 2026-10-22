"use client";

import * as React from "react";
import { DollarSign, ArrowRight } from "lucide-react";
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
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <DollarSign className="h-4 w-4 text-amber-400" />
          <span>Expense-Only Breakdown Mode (No Monthly Income Detected)</span>
        </div>
        <p className="text-xs text-amber-200/80">
          Expense buckets and What-If savings cuts work now. Enter your monthly
          take-home pay to unlock Safe Daily Allowance and Surplus math:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
            {currencySymbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={incomeDraft}
            onChange={(e) => setIncomeDraft(e.target.value)}
            placeholder="3,200"
            aria-label="Monthly income amount"
            className="h-8 w-28 rounded-md border border-slate-700 bg-slate-950 pl-6 pr-2.5 font-mono text-xs tabular-nums text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!incomeDraft.trim()}
          className="h-8"
        >
          Apply Income
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
