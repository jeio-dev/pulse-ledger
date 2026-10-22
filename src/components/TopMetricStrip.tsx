"use client";

import * as React from "react";
import { TrendingUp, Flame, Sparkles, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DerivedCashflowMetrics } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

interface TopMetricStripProps {
  metrics: DerivedCashflowMetrics;
  monthlyIncome: number;
  currencySymbol: string;
  onUpdateMonthlyIncome: (income: number) => void;
}

export function TopMetricStrip({
  metrics,
  monthlyIncome,
  currencySymbol,
  onUpdateMonthlyIncome,
}: TopMetricStripProps) {
  const [isEditingIncome, setIsEditingIncome] = React.useState(false);
  const [incomeDraft, setIncomeDraft] = React.useState(String(monthlyIncome));

  React.useEffect(() => {
    setIncomeDraft(String(monthlyIncome));
  }, [monthlyIncome]);

  const handleIncomeCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Math.round(parseFloat(incomeDraft.replace(/[^0-9.]/g, "")));
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onUpdateMonthlyIncome(parsed);
    }
    setIsEditingIncome(false);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Card 1: Monthly Surplus / Deficit */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">
            Monthly Surplus / Deficit
          </span>
          <Badge variant={metrics.surplusStatus} className="font-mono text-[10px]">
            {metrics.surplusStatusLabel}
          </Badge>
        </div>

        <div className="my-3">
          {metrics.isExpenseOnlyMode ? (
            <div className="font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-300">
              {formatCurrency(metrics.simulatedTotalSpend, currencySymbol)}
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                total spend
              </span>
            </div>
          ) : (
            <div
              className={`font-mono text-2xl font-bold tabular-nums tracking-tight ${
                metrics.simulatedSurplus < 0
                  ? "text-rose-400"
                  : metrics.surplusStatus === "emerald"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {formatCurrency(metrics.simulatedSurplus, currencySymbol, {
                showSign: true,
              })}
              <span className="ml-1 text-xs font-normal text-slate-400">
                /mo
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
          {isEditingIncome ? (
            <form onSubmit={handleIncomeCommit} className="flex items-center gap-1.5">
              <span className="text-slate-400">Income:</span>
              <input
                type="text"
                inputMode="numeric"
                value={incomeDraft}
                onChange={(e) => setIncomeDraft(e.target.value)}
                onBlur={handleIncomeCommit}
                autoFocus
                className="h-6 w-20 rounded border border-emerald-500/60 bg-slate-950 px-1.5 font-mono text-xs tabular-nums text-slate-100 focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingIncome(true)}
              className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-300 hover:text-emerald-400 transition-colors"
              title="Click to edit monthly income"
            >
              <span>
                Inc: {formatCurrency(monthlyIncome, currencySymbol)}
              </span>
              <Pencil className="h-2.5 w-2.5 text-slate-500" />
            </button>
          )}
          <span className="font-mono tabular-nums text-slate-400">
            Spend: {formatCurrency(metrics.simulatedTotalSpend, currencySymbol)}
          </span>
        </div>
      </Card>

      {/* Card 2: Safe Daily Allowance vs. Actual Daily Spend */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">
            Safe Daily vs. Actual Burn
          </span>
          <Badge variant={metrics.dailyBurnStatus} className="font-mono text-[10px]">
            {metrics.dailyBurnStatusLabel}
          </Badge>
        </div>

        <div className="my-3 grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Safe Allowance
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold tabular-nums tracking-tight text-slate-100">
              {metrics.isExpenseOnlyMode
                ? "—"
                : formatCurrency(metrics.safeDailyAllowance, currencySymbol, {
                    decimals: 2,
                  })}
              {!metrics.isExpenseOnlyMode && (
                <span className="text-[11px] font-normal text-slate-500">
                  /d
                </span>
              )}
            </div>
          </div>

          <div className="border-l border-slate-800 pl-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Actual Daily Burn
            </div>
            <div
              className={`mt-0.5 font-mono text-xl font-bold tabular-nums tracking-tight ${
                metrics.isExpenseOnlyMode
                  ? "text-slate-100"
                  : metrics.dailyBurnStatus === "emerald"
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {formatCurrency(metrics.simulatedDailySpend, currencySymbol, {
                decimals: 2,
              })}
              <span className="text-[11px] font-normal text-slate-500">/d</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
          <span className="text-slate-400">30-Day Non-Fixed Pace</span>
          {metrics.isExpenseOnlyMode ? (
            <span className="font-mono tabular-nums text-amber-400">
              Add income above
            </span>
          ) : (
            <span
              className={`font-mono font-medium tabular-nums ${
                metrics.dailyDelta >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {metrics.dailyDelta >= 0
                ? `${formatCurrency(metrics.dailyDelta, currencySymbol, {
                    showSign: true,
                    decimals: 2,
                  })}/day buffer`
                : `${formatCurrency(metrics.dailyDelta, currencySymbol, {
                    decimals: 2,
                  })}/day over`}
            </span>
          )}
        </div>
      </Card>

      {/* Card 3: Largest Leak & 1-Year Impact */}
      <Card className="flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">
            Largest Leak &amp; 1-Yr Impact
          </span>
          <Badge
            variant={
              metrics.annualizedSavings > 0
                ? "emerald"
                : metrics.largestLeakCategory.category === "want"
                ? "violet"
                : "sky"
            }
            className="font-mono text-[10px]"
          >
            {metrics.annualizedSavings > 0 ? (
              <>
                <Sparkles className="h-2.5 w-2.5" />
                {formatCurrency(metrics.monthlySaved, currencySymbol)}/mo Cut
              </>
            ) : (
              <>
                <Flame className="h-2.5 w-2.5" />
                Top Adjustable Bucket
              </>
            )}
          </Badge>
        </div>

        <div className="my-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {metrics.largestLeakCategory.label}
            </span>
            <span className="font-mono text-sm font-bold tabular-nums text-violet-400">
              {formatCurrency(
                metrics.largestLeakCategory.simulatedAmount,
                currencySymbol
              )}
              /mo
            </span>
          </div>

          <div className="mt-2 rounded-lg border border-slate-800/90 bg-slate-950/70 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                1-Year Projected Savings
              </span>
              <span
                className={`font-mono text-sm font-bold tabular-nums ${
                  metrics.annualizedSavings > 0
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {formatCurrency(metrics.annualizedSavings, currencySymbol, {
                  showSign: metrics.annualizedSavings > 0,
                })}
                /yr
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
          <span>Baseline Spend</span>
          <span className="font-mono tabular-nums text-slate-300">
            {formatCurrency(metrics.baselineTotalSpend, currencySymbol)}/mo
          </span>
        </div>
      </Card>
    </div>
  );
}
