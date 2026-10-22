"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DerivedCashflowMetrics } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

interface ProportionBarProps {
  metrics: DerivedCashflowMetrics;
  currencySymbol: string;
}

export function ProportionBar({ metrics, currencySymbol }: ProportionBarProps) {
  const {
    essentialPct,
    flexiblePct,
    wantPct,
    surplusPct,
    isDeficitBar,
  } = metrics.proportion;

  return (
    <div className="border-x border-b border-rule-hairline bg-paper-sheet">
      {/* Allocation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="type-micro-label text-ink-secondary">
            CASHFLOW ALLOCATION DISTRIBUTION
          </span>
          {isDeficitBar && (
            <Badge variant="rose">
              <AlertTriangle className="h-3 w-3" />
              OVERRUN BY{" "}
              {formatCurrency(Math.abs(metrics.simulatedSurplus), currencySymbol)}
            </Badge>
          )}
        </div>
        <span className="type-micro-label tabular-nums text-ink-muted">
          {isDeficitBar || metrics.isExpenseOnlyMode
            ? "BASIS: % OF SIMULATED SPEND"
            : "BASIS: % OF MONTHLY INCOME"}
        </span>
      </div>

      {/* Horizontal Segmented Solid-Block Bar (Zero Gradients, 2px Structural Gaps) */}
      <div className="px-5 pb-4">
        <div className="flex h-3 w-full gap-0.5 border border-rule-hairline bg-paper-base p-0.5">
          {essentialPct > 0 && (
            <div
              style={{ width: `${essentialPct}%` }}
              className="h-full bg-ink-muted"
              title={`01 Fixed Essentials: ${essentialPct.toFixed(1)}%`}
            />
          )}
          {flexiblePct > 0 && (
            <div
              style={{ width: `${flexiblePct}%` }}
              className="h-full bg-ink-secondary"
              title={`02 Flexible Living: ${flexiblePct.toFixed(1)}%`}
            />
          )}
          {wantPct > 0 && (
            <div
              style={{ width: `${wantPct}%` }}
              className="h-full bg-ink-primary"
              title={`03 Discretionary Wants: ${wantPct.toFixed(1)}%`}
            />
          )}
          {surplusPct > 0 && (
            <div
              style={{ width: `${surplusPct}%` }}
              className="h-full bg-accent-primary"
              title={`04 Net Surplus: ${surplusPct.toFixed(1)}%`}
            />
          )}
        </div>
      </div>

      {/* 4-Column Structural Hairline Legend */}
      <div className="grid grid-cols-2 divide-x divide-y divide-rule-hairline border-t border-rule-hairline bg-paper-base font-mono text-xs tabular-nums sm:grid-cols-4 sm:divide-y-0">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-ink-muted" />
            <span className="text-[11px] uppercase text-ink-secondary">
              01 Essentials
            </span>
          </div>
          <span className="font-semibold text-ink-primary">
            {essentialPct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-ink-secondary" />
            <span className="text-[11px] uppercase text-ink-secondary">
              02 Flexible
            </span>
          </div>
          <span className="font-semibold text-ink-primary">
            {flexiblePct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-ink-primary" />
            <span className="text-[11px] uppercase text-ink-secondary">
              03 Wants
            </span>
          </div>
          <span className="font-semibold text-ink-primary">
            {wantPct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 ${
                isDeficitBar ? "bg-status-deficit" : "bg-accent-primary"
              }`}
            />
            <span className="text-[11px] uppercase text-ink-secondary">
              04 {isDeficitBar ? "Deficit" : "Surplus"}
            </span>
          </div>
          <span
            className={`font-semibold ${
              isDeficitBar ? "text-status-deficit" : "text-accent-primary"
            }`}
          >
            {isDeficitBar
              ? formatCurrency(metrics.simulatedSurplus, currencySymbol)
              : `${surplusPct.toFixed(0)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
