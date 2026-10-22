"use client";

import * as React from "react";
import { Activity, Sparkles, Cpu } from "lucide-react";
import { InputPanel } from "@/components/InputPanel";
import { ReadyEmptyState } from "@/components/ReadyEmptyState";
import { ExpenseOnlyBanner } from "@/components/ExpenseOnlyBanner";
import { TopMetricStrip } from "@/components/TopMetricStrip";
import { ProportionBar } from "@/components/ProportionBar";
import { CategoryLedger } from "@/components/CategoryLedger";
import { Badge } from "@/components/ui/badge";
import {
  computeDerivedMetrics,
  computeSimulatedAmount,
  normalizeLedgerState,
} from "@/lib/calculations";
import {
  BudgetResponseSchema,
  type BudgetLedgerState,
} from "@/lib/schemas";

export default function PulseLedgerPage() {
  const [rawInput, setRawInput] = React.useState("");
  const [ledger, setLedger] = React.useState<BudgetLedgerState | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const metrics = React.useMemo(
    () => (ledger ? computeDerivedMetrics(ledger) : null),
    [ledger]
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
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header Bar */}
      <header className="border-b border-slate-800/90 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-100">
                  PulseLedger
                </h1>
                <Badge variant="emerald" className="font-mono text-[10px]">
                  30-Day Triage
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Plain-English Cashflow Parser &amp; Real-Time What-If Simulator
              </p>
            </div>
          </div>

          {ledger && (
            <div className="flex items-center gap-2">
              <Badge
                variant={ledger.parserSource === "ai" ? "emerald" : "default"}
                className="font-mono text-[11px]"
              >
                {ledger.parserSource === "ai" ? (
                  <>
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    AI Extracted
                  </>
                ) : (
                  <>
                    <Cpu className="h-3 w-3 text-slate-400" />
                    Fallback Parser
                  </>
                )}
              </Badge>
            </div>
          )}
        </div>
      </header>

      {/* Main Two-Column Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Brain-Dump Input Panel */}
          <div className="lg:col-span-4">
            <InputPanel
              rawInput={rawInput}
              onRawInputChange={(val) => {
                setRawInput(val);
                if (errorMessage) setErrorMessage(null);
              }}
              onAnalyze={handleAnalyze}
              onClearAll={handleClearAll}
              isLoading={isLoading}
              errorMessage={errorMessage}
              hasActiveLedger={Boolean(ledger)}
            />
          </div>

          {/* Right Column: Interactive Dashboard */}
          <div className="lg:col-span-8">
            {!ledger || !metrics ? (
              <ReadyEmptyState />
            ) : (
              <div className="space-y-5">
                {metrics.isExpenseOnlyMode && (
                  <ExpenseOnlyBanner
                    currencySymbol={ledger.currencySymbol}
                    onUpdateMonthlyIncome={handleUpdateMonthlyIncome}
                  />
                )}

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

                <CategoryLedger
                  items={ledger.items}
                  currencySymbol={ledger.currencySymbol}
                  adjustedItemsCount={metrics.adjustedItemsCount}
                  onSliderChange={handleSliderChange}
                  onResetSliders={handleResetSliders}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
