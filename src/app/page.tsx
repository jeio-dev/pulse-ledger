"use client";

import * as React from "react";
import { InputPanel } from "@/components/InputPanel";
import { ReadyEmptyState } from "@/components/ReadyEmptyState";
import { ExpenseOnlyBanner } from "@/components/ExpenseOnlyBanner";
import { TopMetricStrip } from "@/components/TopMetricStrip";
import { ProportionBar } from "@/components/ProportionBar";
import { CategoryLedger } from "@/components/CategoryLedger";
import { ActionPlanBar } from "@/components/ActionPlanBar";
import { Badge } from "@/components/ui/badge";
import {
  computeDerivedMetrics,
  computeSimulatedAmount,
  normalizeLedgerState,
} from "@/lib/calculations";
import {
  BudgetLedgerStateSchema,
  BudgetResponseSchema,
  type BudgetLedgerState,
} from "@/lib/schemas";

const STORAGE_KEY = "pulse_ledger_state";

function parseSavedLedgerState(
  rawJson: string | null
): BudgetLedgerState | null {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson);
    const validated = BudgetLedgerStateSchema.safeParse(parsed);
    if (!validated.success) {
      return null;
    }
    return normalizeLedgerState(validated.data);
  } catch {
    return null;
  }
}

export default function PulseLedgerPage() {
  const [rawInput, setRawInput] = React.useState("");
  const [ledger, setLedger] = React.useState<BudgetLedgerState | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Hydrate workspace from localStorage["pulse_ledger_state"] on mount
  React.useEffect(() => {
    try {
      const savedRaw = window.localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const restored = parseSavedLedgerState(savedRaw);
        if (restored) {
          setLedger(restored);
          setRawInput(restored.rawInput);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Ignore storage access errors in restricted environments
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist active ledger state to localStorage["pulse_ledger_state"]
  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      if (ledger) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [ledger, isHydrated]);

  const metrics = React.useMemo(
    () => (ledger ? computeDerivedMetrics(ledger) : null),
    [ledger]
  );

  const handleRawInputChange = React.useCallback(
    (nextValue: string) => {
      setRawInput(nextValue);
      if (errorMessage) setErrorMessage(null);
      setLedger((prev) => (prev ? { ...prev, rawInput: nextValue } : null));
    },
    [errorMessage]
  );

  const handleAnalyze = async (overrideInput?: string) => {
    const textToParse = (overrideInput ?? rawInput).trim();
    if (!textToParse) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/parse-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: textToParse }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(
          payload?.error ||
            "Unable to parse cashflow text. Include dollar figures or try a preset."
        );
        return;
      }

      const parsed = BudgetResponseSchema.safeParse(payload);
      if (!parsed.success) {
        setErrorMessage("Received an invalid response format from parser.");
        return;
      }

      const nextState = normalizeLedgerState({
        rawInput: textToParse,
        monthlyIncome: parsed.data.monthlyIncome,
        currencySymbol: parsed.data.currencySymbol,
        parserSource: parsed.data.parserSource,
        items: parsed.data.items.map((item) => ({
          ...item,
          ...computeSimulatedAmount(item.category, item.baselineAmount, 100),
        })),
      });

      setLedger(nextState);
    } catch {
      setErrorMessage(
        "Network error while analyzing cashflow. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = React.useCallback(
    (itemId: string, newPercent: number) => {
      setLedger((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => {
            if (item.id !== itemId) return item;
            const { sliderPercent, simulatedAmount } = computeSimulatedAmount(
              item.category,
              item.baselineAmount,
              newPercent
            );
            return {
              ...item,
              sliderPercent,
              simulatedAmount,
            };
          }),
        };
      });
    },
    []
  );

  const handleResetSliders = React.useCallback(() => {
    setLedger((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => ({
          ...item,
          ...computeSimulatedAmount(item.category, item.baselineAmount, 100),
        })),
      };
    });
  }, []);

  const handleUpdateMonthlyIncome = React.useCallback((income: number) => {
    setLedger((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        monthlyIncome: Math.max(0, Math.round(income)),
      };
    });
  }, []);

  const handleClearAll = () => {
    setRawInput("");
    setLedger(null);
    setErrorMessage(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-paper-base text-ink-primary">
      {/* Header */}
      <header className="border-b border-rule-hairline bg-paper-sheet">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-lg font-bold tracking-[-0.02em] text-ink-primary">
              PulseLedger
            </h1>
            <span className="hidden text-xs text-ink-muted sm:inline">
              30-Day Cashflow Simulator
            </span>
          </div>

          {ledger && (
            <Badge
              variant={ledger.parserSource === "ai" ? "emerald" : "default"}
            >
              {ledger.parserSource === "ai" ? "AI Parsed" : "Fallback Parser"}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Two-Column Workspace */}
      <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Rail (4 Columns, Sticky): Raw Statement Intake Console */}
          <div className="lg:sticky lg:top-5 lg:col-span-4">
            <InputPanel
              rawInput={rawInput}
              onRawInputChange={handleRawInputChange}
              onAnalyze={handleAnalyze}
              onClearAll={handleClearAll}
              isLoading={isLoading}
              errorMessage={errorMessage}
              hasActiveLedger={Boolean(ledger)}
            />
          </div>

          {/* Right Stage (8 Columns): Asymmetric Triage & Simulation Ledger */}
          <div className="lg:col-span-8">
            {!ledger || !metrics ? (
              <div className="animate-ledger-reveal stagger-1">
                <ReadyEmptyState />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Orchestrated Entrance Block 1 (0ms delay): Primary Triage & Allocation */}
                <div className="animate-ledger-reveal stagger-1 space-y-4">
                  {metrics.isExpenseOnlyMode && (
                    <ExpenseOnlyBanner
                      currencySymbol={ledger.currencySymbol}
                      onUpdateMonthlyIncome={handleUpdateMonthlyIncome}
                    />
                  )}

                  <div>
                    <TopMetricStrip
                      metrics={metrics}
                      monthlyIncome={ledger.monthlyIncome}
                      currencySymbol={ledger.currencySymbol}
                      onUpdateMonthlyIncome={handleUpdateMonthlyIncome}
                    />
                    <ProportionBar
                      metrics={metrics}
                      currencySymbol={ledger.currencySymbol}
                    />
                  </div>
                </div>

                {/* Orchestrated Entrance Block 2 (40ms delay): Unified Category Statement */}
                <div className="animate-ledger-reveal stagger-2">
                  <CategoryLedger
                    items={ledger.items}
                    currencySymbol={ledger.currencySymbol}
                    adjustedItemsCount={metrics.adjustedItemsCount}
                    onSliderChange={handleSliderChange}
                    onResetSliders={handleResetSliders}
                  />
                </div>

                {/* Orchestrated Entrance Block 3 (80ms delay): Action Plan Sign-Off Bar */}
                <div className="animate-ledger-reveal stagger-3">
                  <ActionPlanBar
                    ledger={ledger}
                    metrics={metrics}
                    onResetSliders={handleResetSliders}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
