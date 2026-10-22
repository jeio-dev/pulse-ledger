"use client";

import * as React from "react";
import { Lock, RotateCcw, SlidersHorizontal, Lightbulb } from "lucide-react";
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
  subtitle: string;
  accentDot: string;
  badgeVariant: "locked" | "sky" | "violet";
}> = [
  {
    category: "essential",
    title: "Fixed Essentials",
    subtitle: "Strictly locked at 100% — rent & fixed bills cannot be slid down mid-month",
    accentDot: "bg-slate-400",
    badgeVariant: "locked",
  },
  {
    category: "flexible",
    title: "Flexible Living",
    subtitle: "Variable necessities — scrub sliders (0%–150%) to simulate realistic trims",
    accentDot: "bg-sky-400",
    badgeVariant: "sky",
  },
  {
    category: "want",
    title: "Discretionary Wants",
    subtitle: "High-leverage lifestyle leaks — dial back to flip daily burn into surplus",
    accentDot: "bg-violet-400",
    badgeVariant: "violet",
  },
];

export function CategoryLedger({
  items,
  currencySymbol,
  adjustedItemsCount,
  onSliderChange,
  onResetSliders,
}: CategoryLedgerProps) {
  return (
    <div className="space-y-4">
      {/* Ledger Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Interactive What-If Category Ledger
          </h2>
          {adjustedItemsCount > 0 && (
            <Badge variant="emerald" className="font-mono text-[10px]">
              {adjustedItemsCount} active{" "}
              {adjustedItemsCount === 1 ? "adjustment" : "adjustments"}
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetSliders}
          disabled={adjustedItemsCount === 0}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Sliders (100%)
        </Button>
      </div>

      {/* Category Sections */}
      {BUCKET_CONFIG.map((bucket) => {
        const groupItems = items.filter((i) => i.category === bucket.category);
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
          <div
            key={bucket.category}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90"
          >
            {/* Category Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/60 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${bucket.accentDot}`}
                  />
                  <h3 className="text-sm font-semibold text-slate-100">
                    {bucket.title}
                  </h3>
                  <Badge
                    variant={bucket.badgeVariant}
                    className="font-mono text-[10px]"
                  >
                    {groupItems.length} {groupItems.length === 1 ? "item" : "items"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {bucket.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono tabular-nums">
                {bucketDelta !== 0 && (
                  <span className="text-xs text-slate-500 line-through">
                    {formatCurrency(baselineSubtotal, currencySymbol)}
                  </span>
                )}
                <span className="text-sm font-bold text-slate-100">
                  {formatCurrency(simulatedSubtotal, currencySymbol)}
                </span>
                {bucketDelta !== 0 && (
                  <Badge
                    variant={bucketDelta < 0 ? "emerald" : "rose"}
                    className="font-mono text-[10px]"
                  >
                    {formatCurrency(bucketDelta, currencySymbol, {
                      showSign: true,
                    })}
                  </Badge>
                )}
              </div>
            </div>

            {/* Category Rows */}
            {groupItems.length === 0 ? (
              <div className="px-4 py-4 text-xs text-slate-500">
                No expenses categorized in {bucket.title}.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {groupItems.map((item) => {
                  const isEssential = item.category === "essential";
                  const itemDelta = item.simulatedAmount - item.baselineAmount;

                  if (isEssential) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-900/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-slate-200">
                              {item.label}
                            </span>
                            <Badge
                              variant="locked"
                              className="font-mono text-[10px]"
                            >
                              <Lock className="h-2.5 w-2.5" />
                              Locked
                            </Badge>
                          </div>
                          {item.aiTip && (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {item.aiTip}
                            </p>
                          )}
                        </div>

                        <div className="font-mono text-sm font-semibold tabular-nums text-slate-200">
                          {formatCurrency(item.baselineAmount, currencySymbol)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="space-y-2.5 px-4 py-3.5 hover:bg-slate-900/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-100">
                            {item.label}
                          </span>
                          <Badge
                            variant={
                              item.sliderPercent < 100
                                ? "emerald"
                                : item.sliderPercent > 100
                                ? "rose"
                                : "default"
                            }
                            className="font-mono tabular-nums text-[10px]"
                          >
                            {item.sliderPercent}%
                            {itemDelta !== 0 &&
                              ` (${formatCurrency(itemDelta, currencySymbol, {
                                showSign: true,
                              })})`}
                          </Badge>
                        </div>

                        <div className="flex items-baseline gap-2 font-mono tabular-nums">
                          <span className="text-xs text-slate-500">
                            Base:{" "}
                            {formatCurrency(item.baselineAmount, currencySymbol)}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              item.sliderPercent < 100
                                ? "text-emerald-400"
                                : item.sliderPercent > 100
                                ? "text-rose-400"
                                : "text-slate-100"
                            }`}
                          >
                            {formatCurrency(item.simulatedAmount, currencySymbol)}
                          </span>
                        </div>
                      </div>

                      {/* 0% - 150% What-If Slider */}
                      <div className="flex items-center gap-3">
                        <span className="w-7 font-mono text-[10px] tabular-nums text-slate-500">
                          0%
                        </span>
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
                          className="flex-1"
                        />
                        <span className="w-9 text-right font-mono text-[10px] tabular-nums text-slate-500">
                          150%
                        </span>
                      </div>

                      {item.aiTip && (
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                          <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-400/80" />
                          <span>{item.aiTip}</span>
                        </div>
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
  );
}
