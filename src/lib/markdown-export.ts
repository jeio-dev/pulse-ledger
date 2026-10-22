import type { DerivedCashflowMetrics } from "./calculations";
import type { BudgetLedgerState } from "./schemas";

function formatCurrency(
  amount: number,
  currencySymbol = "$",
  options?: { showSign?: boolean; decimals?: number }
): string {
  const decimals = options?.decimals ?? 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (amount < 0) {
    return `-${currencySymbol}${formatted}`;
  }
  if (options?.showSign && amount > 0) {
    return `+${currencySymbol}${formatted}`;
  }
  return `${currencySymbol}${formatted}`;
}

export function formatActionPlanMarkdown(
  state: BudgetLedgerState,
  metrics: DerivedCashflowMetrics
): string {
  const sym = state.currencySymbol || "$";

  const cutItems = state.items.filter(
    (item) => item.category !== "essential" && item.sliderPercent < 100
  );

  const increasedItems = state.items.filter(
    (item) => item.category !== "essential" && item.sliderPercent > 100
  );

  const cutsChecklistLines =
    cutItems.length > 0
      ? cutItems.map((item) => {
          const saved = item.baselineAmount - item.simulatedAmount;
          return `- [ ] Cut **${item.label}** (${item.sliderPercent}%) from ${formatCurrency(
            item.baselineAmount,
            sym
          )} to ${formatCurrency(item.simulatedAmount, sym)} (Save ${formatCurrency(
            saved,
            sym
          )}/mo)${item.aiTip ? ` — _Tip: ${item.aiTip}_` : ""}`;
        })
      : [
          "- [ ] _No What-If slider cuts active yet (all adjustable items are at or above 100% baseline)._",
        ];

  if (increasedItems.length > 0) {
    for (const item of increasedItems) {
      const added = item.simulatedAmount - item.baselineAmount;
      cutsChecklistLines.push(
        `- [ ] Note: Increased **${item.label}** (${item.sliderPercent}%) from ${formatCurrency(
          item.baselineAmount,
          sym
        )} to ${formatCurrency(item.simulatedAmount, sym)} (+${formatCurrency(
          added,
          sym
        )}/mo)`
      );
    }
  }

  const dailyBufferText = metrics.isExpenseOnlyMode
    ? "N/A (Expense-Only Mode — add monthly income to compute Safe Daily Allowance)"
    : metrics.dailyDelta >= 0
    ? `${formatCurrency(metrics.dailyDelta, sym, {
        showSign: true,
        decimals: 2,
      })}/day safe buffer`
    : `${formatCurrency(metrics.dailyDelta, sym, {
        decimals: 2,
      })}/day overspend`;

  return [
    "# PulseLedger Monthly Action Plan",
    "",
    "## Cashflow Summary",
    `- **Monthly Income:** ${formatCurrency(state.monthlyIncome, sym)}/mo`,
    `- **Total Spend:** ${formatCurrency(
      metrics.baselineTotalSpend,
      sym
    )}/mo baseline → **${formatCurrency(
      metrics.simulatedTotalSpend,
      sym
    )}/mo simulated**`,
    `- **Monthly Balance:** ${formatCurrency(metrics.baselineSurplus, sym, {
      showSign: true,
    })}/mo baseline → **${formatCurrency(metrics.simulatedSurplus, sym, {
      showSign: true,
    })}/mo simulated** (${metrics.surplusStatusLabel})`,
    "",
    "## Daily Pace (30-Day Month)",
    `- **Safe Daily Allowance (after Fixed Essentials):** ${
      metrics.isExpenseOnlyMode
        ? "N/A"
        : `${formatCurrency(metrics.safeDailyAllowance, sym, { decimals: 2 })}/day`
    }`,
    `- **Simulated Daily Spend (Flexible + Wants):** ${formatCurrency(
      metrics.simulatedDailySpend,
      sym,
      { decimals: 2 }
    )}/day (${dailyBufferText})`,
    "",
    "## 1-Year Impact",
    `- **Projected Annual Savings:** **${formatCurrency(
      metrics.annualizedSavings,
      sym
    )}/year** (from ${formatCurrency(
      Math.max(0, metrics.monthlySaved),
      sym
    )}/month in net cuts)`,
    `- **Largest Adjustable Bucket:** ${
      metrics.largestLeakCategory.label
    } (${formatCurrency(metrics.largestLeakCategory.simulatedAmount, sym)}/mo)`,
    "",
    "## Actionable Cuts Checklist",
    ...cutsChecklistLines,
    "",
  ].join("\n");
}
