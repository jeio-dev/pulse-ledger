"use client";

import * as React from "react";
import { Lock, RotateCcw } from "lucide-react";
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
  indexCode: string;
  category: ExpenseCategory;
  title: string;
  subtitle: string;
  ruleIndicator: string;
}> = [
  {
    indexCode: "01",
    category: "essential",
    title: "Fixed Essentials",
    subtitle:
      "Strictly locked at 100% — contractual rent & fixed bills cannot be scrubbed mid-month",
    ruleIndicator: "bg-ink-muted",
  },
  {
    indexCode: "02",
    category: "flexible",
    title: "Flexible Living",
    subtitle:
      "Variable necessities — scrub 0%–150% sliders to model realistic operational trims",
    ruleIndicator: "bg-ink-secondary",
  },
  {
    indexCode: "03",
    category: "want",
    title: "Discretionary Wants",
    subtitle:
      "High-leverage lifestyle leaks — dial down to flip daily burn into net surplus",
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
  return (
    <section
      aria-label="Interactive What-If Category Statement"
      className="border border-rule-hairline bg-paper-sheet"
    >
      {/* Sticky Scroll-Pinned Ledger Header (Motion Spec 2: 180ms cubic-bezier(0.16, 1, 0.3, 1)) */}
      <div className="triage-pin-transition sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-rule-hairline bg-paper-base/95 px-5 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="type-micro-label text-ink-muted">
              SEC 03 // LINE-ITEM SIMULATION LEDGER
            </div>
            <h2 className="type-section-header mt-0.5 text-ink-primary">
              Interactive What-If Statement
            </h2>
          </div>

          {adjustedItemsCount > 0 && (
            <Badge variant="emerald">
              {adjustedItemsCount} ACTIVE{" "}
              {adjustedItemsCount === 1 ? "MODIFICATION" : "MODIFICATIONS"}
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
          RESET ALL (100%)
        </Button>
      </div>

      {/* Column Legend Strip (Desktop 12-Col Reference) */}
      <div className="hidden grid-cols-12 border-b border-rule-hairline bg-paper-sheet px-5 py-2 type-micro-label text-ink-muted md:grid">
        <div className="col-span-5">LINE ITEM &amp; TRIAGE NOTE</div>
        <div className="col-span-4">WHAT-IF SCRUBBER (0% — 150%)</div>
        <div className="col-span-3 text-right">BASELINE / SIMULATED</div>
      </div>

      {/* Unified Border-Collapsed Category Sections */}
      <div className="divide-y divide-rule-hairline">
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
            <div key={bucket.category} className="bg-paper-sheet">
              {/* Structural Bucket Header Band */}
              <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-rule-hairline bg-paper-base px-5 py-3">
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-[3px] ${bucket.ruleIndicator}`}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-accent-primary">
                      {bucket.indexCode} //
                    </span>
                    <h3 className="type-bucket-title text-ink-primary">
                      {bucket.title}
                    </h3>
                    <Badge variant="default">
                      {groupItems.length}{" "}
                      {groupItems.length === 1 ? "ENTRY" : "ENTRIES"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-secondary">
                    {bucket.subtitle}
                  </p>
                </div>

                {/* Subtotal Readout */}
                <div className="flex items-center gap-2.5 font-mono tabular-nums">
                  {bucketDelta !== 0 && (
                    <span className="text-xs text-ink-muted line-through">
                      {formatCurrency(baselineSubtotal, currencySymbol)}
                    </span>
                  )}
                  <span className="text-base font-semibold text-ink-primary">
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

              {/* Asymmetric 12-Column Statement Rows */}
              {groupItems.length === 0 ? (
                <div className="px-5 py-4 font-mono text-xs uppercase text-ink-muted">
                  NO ENTRIES LOGGED IN {bucket.title.toUpperCase()}.
                </div>
              ) : (
                <div className="divide-y divide-rule-hairline">
                  {groupItems.map((item) => {
                    const isEssential = item.category === "essential";
                    const itemDelta = item.simulatedAmount - item.baselineAmount;

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 transition-opacity duration-180 ease-ledger-out hover:bg-paper-interactive md:grid-cols-12 md:gap-4"
                      >
                        {/* Columns 1–5: Item Label & Inline Triage Note */}
                        <div className="min-w-0 md:col-span-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-sans text-[15px] font-medium text-ink-primary">
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
                          {item.aiTip && (
                            <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-secondary">
                              {item.aiTip}
                            </p>
                          )}
                        </div>

                        {/* Columns 6–9: Scrubber Control or Locked Stamp */}
                        <div className="md:col-span-4">
                          {isEssential ? (
                            <div className="inline-flex items-center gap-1.5 border border-rule-hairline bg-paper-base px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                              <Lock className="h-3 w-3" />
                              LOCKED · 100% BASELINE
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 font-mono text-[11px] tabular-nums text-ink-muted">
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
                              <span className="w-9 text-right font-mono text-[11px] tabular-nums text-ink-muted">
                                150%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Columns 10–12: Right-Aligned Tabular Currency Figures */}
                        <div className="flex items-baseline justify-between gap-2 font-mono tabular-nums md:col-span-3 md:justify-end">
                          <span className="text-[11px] uppercase text-ink-muted md:hidden">
                            {isEssential
                              ? "LOCKED AMOUNT"
                              : `SIMULATED (${item.sliderPercent}%)`}
                          </span>

                          <div className="flex items-baseline gap-2.5">
                            {!isEssential && itemDelta !== 0 && (
                              <span className="text-xs text-ink-muted line-through">
                                {formatCurrency(
                                  item.baselineAmount,
                                  currencySymbol
                                )}
                              </span>
                            )}
                            <span
                              className={`text-[15px] font-semibold ${
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
