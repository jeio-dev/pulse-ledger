"use client";

import * as React from "react";
import { Activity, Lock, Sparkles, Cpu } from "lucide-react";
import { InputPanel } from "@/components/InputPanel";
import { ReadyEmptyState } from "@/components/ReadyEmptyState";
import { Badge } from "@/components/ui/badge";
import {
  BudgetResponseSchema,
  type BudgetLedgerState,
  type ExpenseCategory,
} from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_META: Record<
  ExpenseCategory,
  { title: string; subtitle: string; badgeVariant: "locked" | "sky" | "violet" }
> = {
  essential: {
    title: "Fixed Essentials",
    subtitle: "Locked obligations (Rent, Utilities, Debt, Insurance)",
    badgeVariant: "locked",
  },
  flexible: {
    title: "Flexible Living",
    subtitle: "Adjustable necessities (Groceries, Transit, Supplies)",
    badgeVariant: "sky",
  },
  want: {
    title: "Discretionary Wants",
    subtitle: "Adjustable lifestyle & dining leaks (0%–150% What-If)",
    badgeVariant: "violet",
  },
};

export default function PulseLedgerPage() {
  const [rawInput, setRawInput] = React.useState("");
  const [ledger, setLedger] = React.useState<BudgetLedgerState | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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

      const nextState: BudgetLedgerState = {
        rawInput: textToParse,
        monthlyIncome: parsed.data.monthlyIncome,
        currencySymbol: parsed.data.currencySymbol,
        parserSource: parsed.data.parserSource,
        items: parsed.data.items.map((item) => ({
          ...item,
          sliderPercent: 100,
          simulatedAmount: item.baselineAmount,
        })),
      };

      setLedger(nextState);
    } catch {
      setErrorMessage(
        "Network error while analyzing cashflow. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            {!ledger ? (
              <ReadyEmptyState />
            ) : (
              <div className="space-y-5">
                {/* Parsed Monthly Income & Baseline Summary Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400">
                      Extracted Monthly Income
                    </span>
                    <div className="mt-0.5 font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-100">
                      {formatCurrency(
                        ledger.monthlyIncome,
                        ledger.currencySymbol
                      )}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        /mo
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-400">
                      Parsed Line Items
                    </span>
                    <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-emerald-400">
                      {ledger.items.length} items across 3 buckets
                    </div>
                  </div>
                </div>

                {/* Categorized Expense Groups */}
                {(["essential", "flexible", "want"] as const).map(
                  (category) => {
                    const groupItems = ledger.items.filter(
                      (i) => i.category === category
                    );
                    const subtotal = groupItems.reduce(
                      (sum, item) => sum + item.simulatedAmount,
                      0
                    );
                    const meta = CATEGORY_META[category];

                    return (
                      <div
                        key={category}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/50 px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-100">
                                {meta.title}
                              </h3>
                              <Badge
                                variant={meta.badgeVariant}
                                className="font-mono text-[10px]"
                              >
                                {groupItems.length} items
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {meta.subtitle}
                            </p>
                          </div>
                          <div className="font-mono text-sm font-semibold tabular-nums text-slate-100">
                            {formatCurrency(subtotal, ledger.currencySymbol)}
                          </div>
                        </div>

                        {groupItems.length === 0 ? (
                          <div className="px-4 py-4 text-xs text-slate-500">
                            No items parsed in this category.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/80">
                            {groupItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-900/60"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-100">
                                      {item.label}
                                    </span>
                                    {item.category === "essential" && (
                                      <Badge
                                        variant="locked"
                                        className="font-mono text-[10px]"
                                      >
                                        <Lock className="h-2.5 w-2.5" />
                                        Locked
                                      </Badge>
                                    )}
                                  </div>
                                  {item.aiTip && (
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      {item.aiTip}
                                    </p>
                                  )}
                                </div>
                                <div className="font-mono text-sm font-semibold tabular-nums text-slate-100">
                                  {formatCurrency(
                                    item.simulatedAmount,
                                    ledger.currencySymbol
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
