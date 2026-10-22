"use client";

import * as React from "react";
import { Lock, RotateCcw, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { ExpenseCategory, ExpenseItem } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";

interface CategoryLedgerProps {
  items: ExpenseItem[];
  currencySymbol: string;
  adjustedItemsCount: number;
  onSliderChange: (itemId: string, sliderPercent: number) => void;
  onResetSliders: () => void;
}

const BUCKET_CONFIG: Array<{
  category: ExpenseCategory;
  title: string;
  ruleIndicator: string;
}> = [
  {
    category: "essential",
    title: "Fixed Essentials",
    ruleIndicator: "bg-ink-muted",
  },
  {
    category: "flexible",
    title: "Flexible Living",
    ruleIndicator: "bg-ink-secondary",
  },
  {
    category: "want",
    title: "Discretionary Wants",
    ruleIndicator: "bg-accent-primary",
  },
];

export function CategoryLedger({
  items,
  currencySymbol,
  adjustedItemsCount,
  onSliderChange,
  onResetSliders,
}: CategoryLedgerProps) {
  const [showTips, setShowTips] = React.useState(false);

  return (
    <section
      aria-label="What-If Expense Ledger"
      className="border border-rule-hairline bg-paper-sheet"
    >
      {/* Compact Sticky Header */}
      <div className="triage-pin-transition sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-rule-hairline bg-paper-base/95 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <h2 className="type-section-header text-ink-primary">
            What-If Expenses
          </h2>
          {adjustedItemsCount > 0 && (
            <Badge variant="emerald">{adjustedItemsCount} adjusted</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showTips ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowTips((prev) => !prev)}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {showTips ? "Hide Tips" : "Tips"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetSliders}
            disabled={adjustedItemsCount === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Category Sections */}
      <div className="divide-y divide-rule-hairline">
        {BUCKET_CONFIG.map((bucket) => {
          const groupItems = items.filter((i) => i.category === bucket.category);
          const isEssentialBucket = bucket.category === "essential";
          const baselineSubtotal = groupItems.reduce(
            (sum, i) => sum + i.baselineAmount,
            0
          );
          const simulatedSubtotal = groupItems.reduce(
            (sum, i) => sum + i.simulatedAmount,
            0
          );
          const bucketDelta = simulatedSubtotal - baselineSubtotal;

          return (
            <div key={bucket.category} className="bg-paper-sheet">
              {/* Compact Bucket Header */}
              <div className="relative flex items-center justify-between gap-2 border-b border-rule-hairline bg-paper-base px-4 py-2">
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-[3px] ${bucket.ruleIndicator}`}
                />
                <div className="flex items-center gap-2">
                  <h3 className="type-bucket-title text-ink-primary">
                    {bucket.title}
                  </h3>
                  {isEssentialBucket && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                      <Lock className="h-2.5 w-2.5" />
                      Locked
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-sm tabular-nums">
                  {bucketDelta !== 0 && (
                    <span className="text-xs text-ink-muted line-through">
                      {formatCurrency(baselineSubtotal, currencySymbol)}
                    </span>
                  )}
                  <span className="font-semibold text-ink-primary">
                    {formatCurrency(simulatedSubtotal, currencySymbol)}
                  </span>
                  {bucketDelta !== 0 && (
                    <Badge variant={bucketDelta < 0 ? "emerald" : "rose"}>
                      {formatCurrency(bucketDelta, currencySymbol, {
                        showSign: true,
                      })}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rows */}
              {groupItems.length === 0 ? (
                <div className="px-4 py-3 font-mono text-xs text-ink-muted">
                  No items
                </div>
              ) : (
                <div className="divide-y divide-rule-hairline">
                  {groupItems.map((item) => {
                    const isEssential = item.category === "essential";
                    const itemDelta = item.simulatedAmount - item.baselineAmount;

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-2.5 transition-colors hover:bg-paper-interactive"
                      >
                        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-12 md:gap-4">
                          {/* Item Label */}
                          <div className="flex items-center justify-between gap-2 md:col-span-5 md:justify-start">
                            <span className="truncate text-sm font-medium text-ink-primary">
                              {item.label}
                            </span>
                            {!isEssential && item.sliderPercent !== 100 && (
                              <Badge
                                variant={
                                  item.sliderPercent < 100 ? "emerald" : "rose"
                                }
                              >
                                {item.sliderPercent}%
                              </Badge>
                            )}
                          </div>

                          {/* Slider or Quiet Lock */}
                          <div className="md:col-span-4">
                            {!isEssential && (
                              <Slider
                                min={0}
                                max={150}
                                step={5}
                                value={[item.sliderPercent]}
                                onValueChange={(vals) => {
                                  const nextVal = vals[0] ?? 100;
                                  onSliderChange(item.id, nextVal);
                                }}
                                aria-label={`What-If slider for ${item.label}`}
                              />
                            )}
                          </div>

                          {/* Amount */}
                          <div className="flex items-baseline justify-end gap-2 font-mono text-sm tabular-nums md:col-span-3">
                            {!isEssential && itemDelta !== 0 && (
                              <span className="text-xs text-ink-muted line-through">
                                {formatCurrency(
                                  item.baselineAmount,
                                  currencySymbol
                                )}
                              </span>
                            )}
                            <span
                              className={`font-semibold ${
                                isEssential
                                  ? "text-ink-secondary"
                                  : item.sliderPercent < 100
                                  ? "text-accent-primary"
                                  : item.sliderPercent > 100
                                  ? "text-status-deficit"
                                  : "text-ink-primary"
                              }`}
                            >
                              {formatCurrency(
                                isEssential
                                  ? item.baselineAmount
                                  : item.simulatedAmount,
                                currencySymbol
                              )}
                            </span>
                          </div>
                        </div>

                        {showTips && !isEssential && item.aiTip && (
                          <p className="mt-1.5 text-xs text-ink-secondary">
                            {item.aiTip}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
