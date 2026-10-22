"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
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

  const shortLeakLabel =
    metrics.largestLeakCategory.category === "want" ? "Wants" : "Flexible";

  return (
    <section
      aria-label="Cashflow Summary Metrics"
      className="grid grid-cols-1 divide-y divide-rule-hairline border border-rule-hairline bg-paper-sheet md:grid-cols-3 md:divide-x md:divide-y-0"
    >
      {/* 1. Monthly Balance */}
      <div className="flex flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Monthly Balance
          </span>
          <Badge variant={metrics.surplusStatus}>
            {metrics.surplusStatusLabel}
          </Badge>
        </div>

        <div className="my-3">
          {metrics.isExpenseOnlyMode ? (
            <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink-primary">
              {formatCurrency(metrics.simulatedTotalSpend, currencySymbol)}
              <span className="ml-1.5 text-xs font-normal text-ink-muted">
                spend
              </span>
            </div>
          ) : (
            <div
              className={`font-mono text-2xl font-semibold tabular-nums tracking-tight ${
                metrics.simulatedSurplus < 0
                  ? "text-status-deficit"
                  : metrics.surplusStatus === "emerald"
                  ? "text-accent-primary"
                  : "text-status-caution"
              }`}
            >
              {formatCurrency(metrics.simulatedSurplus, currencySymbol, {
                showSign: true,
              })}
              <span className="ml-1 text-xs font-normal text-ink-muted">
                /mo
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-rule-hairline pt-2 font-mono text-xs tabular-nums text-ink-secondary">
          {isEditingIncome ? (
            <form
              onSubmit={handleIncomeCommit}
              className="flex items-center gap-1"
            >
              <span>In:</span>
              <input
                type="text"
                inputMode="numeric"
                value={incomeDraft}
                onChange={(e) => setIncomeDraft(e.target.value)}
                onBlur={handleIncomeCommit}
                autoFocus
                aria-label="Edit monthly income"
                className="h-5 w-20 border border-accent-primary bg-paper-base px-1 font-mono text-xs tabular-nums text-ink-primary focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingIncome(true)}
              className="inline-flex items-center gap-1 text-ink-primary hover:text-accent-primary"
              title="Click to edit monthly income"
            >
              <span>In: {formatCurrency(monthlyIncome, currencySymbol)}</span>
              <Pencil className="h-2.5 w-2.5 text-ink-muted" />
            </button>
          )}
          <span>
            Out: {formatCurrency(metrics.simulatedTotalSpend, currencySymbol)}
          </span>
        </div>
      </div>

      {/* 2. Safe Daily Limit vs. Actual Burn */}
      <div className="flex flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Daily Burn (30d)
          </span>
          <Badge variant={metrics.dailyBurnStatus}>
            {metrics.dailyBurnStatusLabel}
          </Badge>
        </div>

        <div className="my-3 grid grid-cols-2 gap-3 divide-x divide-rule-hairline">
          <div>
            <div className="text-[11px] text-ink-muted">Safe Limit</div>
            <div className="mt-0.5 font-mono text-xl font-semibold tabular-nums tracking-tight text-ink-primary">
              {metrics.isExpenseOnlyMode
                ? "—"
                : formatCurrency(metrics.safeDailyAllowance, currencySymbol, {
                    decimals: 2,
                  })}
              {!metrics.isExpenseOnlyMode && (
                <span className="text-[11px] font-normal text-ink-muted">
                  /d
                </span>
              )}
            </div>
          </div>

          <div className="pl-3">
            <div className="text-[11px] text-ink-muted">Actual</div>
            <div
              className={`mt-0.5 font-mono text-xl font-semibold tabular-nums tracking-tight ${
                metrics.isExpenseOnlyMode
                  ? "text-ink-primary"
                  : metrics.dailyBurnStatus === "emerald"
                  ? "text-accent-primary"
                  : "text-status-deficit"
              }`}
            >
              {formatCurrency(metrics.simulatedDailySpend, currencySymbol, {
                decimals: 2,
              })}
              <span className="text-[11px] font-normal text-ink-muted">/d</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-rule-hairline pt-2 font-mono text-xs tabular-nums">
          <span className="text-ink-secondary">Net Pace</span>
          {metrics.isExpenseOnlyMode ? (
            <span className="text-status-caution">Set income above</span>
          ) : (
            <span
              className={
                metrics.dailyDelta >= 0
                  ? "text-accent-primary"
                  : "text-status-deficit"
              }
            >
              {metrics.dailyDelta >= 0
                ? `${formatCurrency(metrics.dailyDelta, currencySymbol, {
                    showSign: true,
                    decimals: 2,
                  })}/d buffer`
                : `${formatCurrency(metrics.dailyDelta, currencySymbol, {
                    decimals: 2,
                  })}/d over`}
            </span>
          )}
        </div>
      </div>

      {/* 3. 1-Year Projected Savings & Top Leak */}
      <div className="flex flex-col justify-between p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            1-Year Savings
          </span>
          <Badge
            variant={metrics.annualizedSavings > 0 ? "emerald" : "default"}
          >
            {metrics.monthlySaved > 0
              ? `${formatCurrency(metrics.monthlySaved, currencySymbol)}/mo cut`
              : "Baseline"}
          </Badge>
        </div>

        <div className="my-3">
          <div
            className={`font-mono text-2xl font-semibold tabular-nums tracking-tight ${
              metrics.annualizedSavings > 0
                ? "text-accent-primary"
                : "text-ink-secondary"
            }`}
          >
            {formatCurrency(metrics.annualizedSavings, currencySymbol, {
              showSign: metrics.annualizedSavings > 0,
            })}
            <span className="ml-1 text-xs font-normal text-ink-muted">/yr</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-rule-hairline pt-2 font-mono text-xs tabular-nums">
          <span className="text-ink-secondary">Top Leak: {shortLeakLabel}</span>
          <span className="text-ink-primary">
            {formatCurrency(
              metrics.largestLeakCategory.simulatedAmount,
              currencySymbol
            )}
            /mo
          </span>
        </div>
      </div>
    </section>
  );
}
