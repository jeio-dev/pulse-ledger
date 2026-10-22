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

  return (
    <section
      aria-label="Primary Cashflow Triage Metrics"
      className="border border-rule-hairline bg-paper-sheet"
    >
      {/* Top Structural Serial Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule-hairline bg-paper-base px-5 py-2.5">
        <span className="type-micro-label text-ink-muted">
          SEC 02 // 30-DAY BURN TRIAGE &amp; ANNUALIZED LEVERAGE
        </span>
        <span className="type-micro-label text-ink-secondary">
          FORMULA: (INCOME − FIXED) ÷ 30 DAYS
        </span>
      </div>

      {/* Asymmetric 7 : 5 Ledger Split (Replaces Banned 3-Card Grid) */}
      <div className="grid grid-cols-1 divide-y divide-rule-hairline lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        {/* Visual Anchor (Left 7 Columns): Safe Daily Allowance vs. Actual Daily Burn */}
        <div className="flex flex-col justify-between p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-rule-hairline pb-3.5">
            <div>
              <div className="type-micro-label text-accent-primary">
                PRIMARY ANCHOR // DAILY VARIABLE CAPACITY
              </div>
              <h2 className="type-section-header mt-1 text-ink-primary">
                Safe Daily Allowance vs. Actual Burn
              </h2>
            </div>
            <Badge variant={metrics.dailyBurnStatus}>
              {metrics.dailyBurnStatusLabel}
            </Badge>
          </div>

          {/* Dual 36px Hero Figures */}
          <div className="my-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:divide-x sm:divide-rule-hairline">
            <div>
              <div className="type-micro-label text-ink-secondary">
                01. SAFE DAILY ALLOWANCE
              </div>
              <div className="type-hero-figure mt-2 text-ink-primary">
                {metrics.isExpenseOnlyMode
                  ? "—"
                  : formatCurrency(metrics.safeDailyAllowance, currencySymbol, {
                      decimals: 2,
                    })}
                {!metrics.isExpenseOnlyMode && (
                  <span className="ml-1 font-mono text-sm font-normal text-ink-muted">
                    /DAY
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-mono text-[11px] tabular-nums text-ink-muted">
                After {formatCurrency(metrics.simulatedEssential, currencySymbol)}{" "}
                locked fixed bills
              </p>
            </div>

            <div className="sm:pl-5">
              <div className="type-micro-label text-ink-secondary">
                02. ACTUAL DAILY BURN
              </div>
              <div
                className={`type-hero-figure mt-2 ${
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
                <span className="ml-1 font-mono text-sm font-normal text-ink-muted">
                  /DAY
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[11px] tabular-nums text-ink-muted">
                Across Flexible ({formatCurrency(metrics.simulatedFlexible, currencySymbol)}) + Wants ({formatCurrency(metrics.simulatedWant, currencySymbol)})
              </p>
            </div>
          </div>

          {/* Daily Variance Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule-hairline bg-paper-base px-3.5 py-2.5 font-mono text-xs tabular-nums">
            <span className="text-ink-secondary">
              NET DAILY BURN DIFFERENTIAL
            </span>
            {metrics.isExpenseOnlyMode ? (
              <span className="text-status-caution">
                ENTER MONTHLY INCOME TO COMPUTE BUFFER
              </span>
            ) : (
              <span
                className={`font-semibold ${
                  metrics.dailyDelta >= 0
                    ? "text-accent-primary"
                    : "text-status-deficit"
                }`}
              >
                {metrics.dailyDelta >= 0
                  ? `${formatCurrency(metrics.dailyDelta, currencySymbol, {
                      showSign: true,
                      decimals: 2,
                    })} / DAY SAFE BUFFER`
                  : `${formatCurrency(metrics.dailyDelta, currencySymbol, {
                      decimals: 2,
                    })} / DAY OVERSPEND`}
              </span>
            )}
          </div>
        </div>

        {/* Secondary Ledger Stack (Right 5 Columns): Monthly Balance + 1-Year Projection */}
        <div className="flex flex-col divide-y divide-rule-hairline lg:col-span-5">
          {/* Top Cell: Net Monthly Surplus / Deficit */}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="type-micro-label text-ink-muted">
                  LEDGER CELL A // 30-DAY NET BALANCE
                </div>
                <h3 className="type-bucket-title mt-0.5 text-ink-primary">
                  Monthly Surplus / Deficit
                </h3>
              </div>
              <Badge variant={metrics.surplusStatus}>
                {metrics.surplusStatusLabel}
              </Badge>
            </div>

            <div className="my-3.5">
              {metrics.isExpenseOnlyMode ? (
                <div className="font-mono text-3xl font-semibold tabular-nums tracking-[-0.02em] text-ink-primary">
                  {formatCurrency(metrics.simulatedTotalSpend, currencySymbol)}
                  <span className="ml-1.5 text-xs font-normal uppercase text-ink-muted">
                    TOTAL SPEND
                  </span>
                </div>
              ) : (
                <div
                  className={`font-mono text-3xl font-semibold tabular-nums tracking-[-0.02em] ${
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
                  <span className="ml-1.5 text-xs font-normal uppercase text-ink-muted">
                    / MONTH
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-rule-hairline pt-2.5 font-mono text-xs tabular-nums text-ink-secondary">
              {isEditingIncome ? (
                <form
                  onSubmit={handleIncomeCommit}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-ink-secondary">INC:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeDraft}
                    onChange={(e) => setIncomeDraft(e.target.value)}
                    onBlur={handleIncomeCommit}
                    autoFocus
                    aria-label="Edit monthly income"
                    className="h-6 w-24 rounded-none border border-accent-primary bg-paper-base px-1.5 font-mono text-xs tabular-nums text-ink-primary focus:outline-none"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingIncome(true)}
                  className="inline-flex items-center gap-1.5 text-ink-primary hover:text-accent-primary"
                  title="Click to edit monthly income"
                >
                  <span>
                    INC: {formatCurrency(monthlyIncome, currencySymbol)}
                  </span>
                  <Pencil className="h-3 w-3 text-ink-muted" />
                </button>
              )}
              <span>
                OUT: {formatCurrency(metrics.simulatedTotalSpend, currencySymbol)}
              </span>
            </div>
          </div>

          {/* Bottom Cell: 1-Year Projected Savings & Largest Leak */}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="type-micro-label text-ink-muted">
                  LEDGER CELL B // COMPOUND IMPACT
                </div>
                <h3 className="type-bucket-title mt-0.5 text-ink-primary">
                  1-Year Projected Savings
                </h3>
              </div>
              <Badge
                variant={metrics.annualizedSavings > 0 ? "emerald" : "default"}
              >
                {metrics.monthlySaved > 0
                  ? `${formatCurrency(metrics.monthlySaved, currencySymbol)}/MO CUT`
                  : "BASELINE PACE"}
              </Badge>
            </div>

            <div className="my-3 flex items-baseline justify-between gap-2">
              <div
                className={`font-mono text-2xl font-semibold tabular-nums tracking-[-0.02em] ${
                  metrics.annualizedSavings > 0
                    ? "text-accent-primary"
                    : "text-ink-secondary"
                }`}
              >
                {formatCurrency(metrics.annualizedSavings, currencySymbol, {
                  showSign: metrics.annualizedSavings > 0,
                })}
                <span className="ml-1 text-xs font-normal uppercase text-ink-muted">
                  / YEAR
                </span>
              </div>

              {metrics.monthlySaved > 0 && (
                <span className="font-mono text-xs tabular-nums text-accent-primary">
                  +{formatCurrency(metrics.annualizedCutSavings, currencySymbol)}/yr from cuts
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-rule-hairline pt-2.5 font-mono text-xs tabular-nums">
              <span className="text-ink-secondary">
                TOP LEAK: {metrics.largestLeakCategory.label.toUpperCase()}
              </span>
              <span className="font-semibold text-ink-primary">
                {formatCurrency(
                  metrics.largestLeakCategory.simulatedAmount,
                  currencySymbol
                )}
                /MO
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
