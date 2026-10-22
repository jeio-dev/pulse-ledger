import type { BudgetLedgerState, ExpenseCategory, ExpenseItem } from "./schemas";

export function computeSimulatedAmount(
  category: ExpenseCategory,
  baselineAmount: number,
  sliderPercent: number
): { sliderPercent: number; simulatedAmount: number } {
  const effectivePercent =
    category === "essential" ? 100 : Math.min(150, Math.max(0, sliderPercent));
  return {
    sliderPercent: effectivePercent,
    simulatedAmount: Math.round((baselineAmount * effectivePercent) / 100),
  };
}

export function normalizeExpenseItem(item: ExpenseItem): ExpenseItem {
  const { sliderPercent, simulatedAmount } = computeSimulatedAmount(
    item.category,
    item.baselineAmount,
    item.sliderPercent
  );
  return {
    ...item,
    sliderPercent,
    simulatedAmount,
  };
}

export function normalizeLedgerState(state: BudgetLedgerState): BudgetLedgerState {
  return {
    ...state,
    items: state.items.map(normalizeExpenseItem),
  };
}

export type SemanticStatus = "emerald" | "amber" | "rose";

export interface DerivedCashflowMetrics {
  baselineEssential: number;
  baselineFlexible: number;
  baselineWant: number;
  baselineTotalSpend: number;
  baselineSurplus: number;

  simulatedEssential: number;
  simulatedFlexible: number;
  simulatedWant: number;
  simulatedTotalSpend: number;
  simulatedSurplus: number;

  safeDailyAllowance: number;
  baselineDailySpend: number;
  simulatedDailySpend: number;
  dailyDelta: number;

  largestLeakCategory: {
    category: "flexible" | "want";
    label: string;
    simulatedAmount: number;
    baselineAmount: number;
  };
  monthlySaved: number;
  annualizedCutSavings: number;
  annualizedNetSurplus: number;
  annualizedSavings: number;

  surplusStatus: SemanticStatus;
  surplusStatusLabel: string;
  dailyBurnStatus: SemanticStatus;
  dailyBurnStatusLabel: string;

  proportion: {
    essentialPct: number;
    flexiblePct: number;
    wantPct: number;
    surplusPct: number;
    isDeficitBar: boolean;
  };

  isExpenseOnlyMode: boolean;
  adjustedItemsCount: number;
}

export function computeDerivedMetrics(
  state: BudgetLedgerState
): DerivedCashflowMetrics {
  let baselineEssential = 0;
  let baselineFlexible = 0;
  let baselineWant = 0;

  let simulatedEssential = 0;
  let simulatedFlexible = 0;
  let simulatedWant = 0;
  let adjustedItemsCount = 0;

  for (const rawItem of state.items) {
    const item = normalizeExpenseItem(rawItem);
    if (item.category === "essential") {
      baselineEssential += item.baselineAmount;
      simulatedEssential += item.baselineAmount;
    } else if (item.category === "flexible") {
      baselineFlexible += item.baselineAmount;
      simulatedFlexible += item.simulatedAmount;
      if (item.sliderPercent !== 100) adjustedItemsCount++;
    } else if (item.category === "want") {
      baselineWant += item.baselineAmount;
      simulatedWant += item.simulatedAmount;
      if (item.sliderPercent !== 100) adjustedItemsCount++;
    }
  }

  const baselineTotalSpend = baselineEssential + baselineFlexible + baselineWant;
  const simulatedTotalSpend =
    simulatedEssential + simulatedFlexible + simulatedWant;

  const monthlyIncome = state.monthlyIncome;
  const isExpenseOnlyMode = state.items.length > 0 && monthlyIncome === 0;

  const baselineSurplus = monthlyIncome - baselineTotalSpend;
  const simulatedSurplus = monthlyIncome - simulatedTotalSpend;

  // 30-day daily cashflow formulas
  const safeDailyAllowance = Math.max(0, (monthlyIncome - simulatedEssential) / 30);
  const baselineDailySpend = (baselineFlexible + baselineWant) / 30;
  const simulatedDailySpend = (simulatedFlexible + simulatedWant) / 30;
  const dailyDelta = safeDailyAllowance - simulatedDailySpend;

  // Largest Leak Category (compares adjustable categories: Discretionary Wants vs Flexible Living)
  const largestLeakCategory =
    simulatedWant >= simulatedFlexible
      ? {
          category: "want" as const,
          label: "Discretionary Wants",
          simulatedAmount: simulatedWant,
          baselineAmount: baselineWant,
        }
      : {
          category: "flexible" as const,
          label: "Flexible Living",
          simulatedAmount: simulatedFlexible,
          baselineAmount: baselineFlexible,
        };

  const monthlySaved = baselineTotalSpend - simulatedTotalSpend;
  const annualizedCutSavings = Math.max(0, monthlySaved * 12);
  const annualizedNetSurplus =
    !isExpenseOnlyMode && simulatedSurplus > 0 ? simulatedSurplus * 12 : 0;
  const annualizedSavings =
    annualizedNetSurplus > 0 ? annualizedNetSurplus : annualizedCutSavings;

  // Traffic-light semantic badge logic
  let surplusStatus: SemanticStatus = "amber";
  let surplusStatusLabel = "Tight Margin";

  if (isExpenseOnlyMode) {
    surplusStatus = "amber";
    surplusStatusLabel = "Income Needed";
  } else if (simulatedSurplus < 0) {
    surplusStatus = "rose";
    surplusStatusLabel = "Monthly Deficit";
  } else if (monthlyIncome > 0 && simulatedSurplus >= monthlyIncome * 0.1) {
    surplusStatus = "emerald";
    surplusStatusLabel = "Healthy Surplus";
  } else {
    surplusStatus = "amber";
    surplusStatusLabel = "Tight Margin (<10%)";
  }

  let dailyBurnStatus: SemanticStatus = "emerald";
  let dailyBurnStatusLabel = "Within Safe Daily Limit";

  if (isExpenseOnlyMode) {
    dailyBurnStatus = "amber";
    dailyBurnStatusLabel = "Set Income for Safe Limit";
  } else if (simulatedDailySpend <= safeDailyAllowance) {
    dailyBurnStatus = "emerald";
    dailyBurnStatusLabel = "Safe Daily Pace";
  } else {
    dailyBurnStatus = "rose";
    dailyBurnStatusLabel = "Overspending Daily Limit";
  }

  // Proportion bar percentages
  let essentialPct = 0;
  let flexiblePct = 0;
  let wantPct = 0;
  let surplusPct = 0;
  const isDeficitBar = !isExpenseOnlyMode && simulatedTotalSpend > monthlyIncome;

  if (!isExpenseOnlyMode && simulatedTotalSpend <= monthlyIncome && monthlyIncome > 0) {
    essentialPct = (simulatedEssential / monthlyIncome) * 100;
    flexiblePct = (simulatedFlexible / monthlyIncome) * 100;
    wantPct = (simulatedWant / monthlyIncome) * 100;
    surplusPct = Math.max(0, 100 - (essentialPct + flexiblePct + wantPct));
  } else {
    const denom = Math.max(1, simulatedTotalSpend);
    essentialPct = (simulatedEssential / denom) * 100;
    flexiblePct = (simulatedFlexible / denom) * 100;
    wantPct = (simulatedWant / denom) * 100;
    surplusPct = 0;
  }

  return {
    baselineEssential,
    baselineFlexible,
    baselineWant,
    baselineTotalSpend,
    baselineSurplus,
    simulatedEssential,
    simulatedFlexible,
    simulatedWant,
    simulatedTotalSpend,
    simulatedSurplus,
    safeDailyAllowance,
    baselineDailySpend,
    simulatedDailySpend,
    dailyDelta,
    largestLeakCategory,
    monthlySaved,
    annualizedCutSavings,
    annualizedNetSurplus,
    annualizedSavings,
    surplusStatus,
    surplusStatusLabel,
    dailyBurnStatus,
    dailyBurnStatusLabel,
    proportion: {
      essentialPct,
      flexiblePct,
      wantPct,
      surplusPct,
      isDeficitBar,
    },
    isExpenseOnlyMode,
    adjustedItemsCount,
  };
}
