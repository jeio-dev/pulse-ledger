"use client";

import * as React from "react";
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
    <div className="border-x border-b border-rule-hairline bg-paper-sheet px-4 py-3">
      {/* Stacked Bar */}
      <div className="flex h-2.5 w-full gap-0.5 border border-rule-hairline bg-paper-base p-0.5">
        {essentialPct > 0 && (
          <div
            style={{ width: `${essentialPct}%` }}
            className="h-full bg-ink-muted"
            title={`Fixed Essentials: ${essentialPct.toFixed(0)}%`}
          />
        )}
        {flexiblePct > 0 && (
          <div
            style={{ width: `${flexiblePct}%` }}
            className="h-full bg-ink-secondary"
            title={`Flexible Living: ${flexiblePct.toFixed(0)}%`}
          />
        )}
        {wantPct > 0 && (
          <div
            style={{ width: `${wantPct}%` }}
            className="h-full bg-ink-primary"
            title={`Discretionary Wants: ${wantPct.toFixed(0)}%`}
          />
        )}
        {surplusPct > 0 && (
          <div
            style={{ width: `${surplusPct}%` }}
            className="h-full bg-accent-primary"
            title={`Surplus: ${surplusPct.toFixed(0)}%`}
          />
        )}
      </div>

      {/* Compact Inline Legend */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-ink-secondary">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-ink-muted" />
            <span>Essentials {essentialPct.toFixed(0)}%</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-ink-secondary" />
            <span>Flexible {flexiblePct.toFixed(0)}%</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 bg-ink-primary" />
            <span>Wants {wantPct.toFixed(0)}%</span>
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 font-medium ${
            isDeficitBar ? "text-status-deficit" : "text-accent-primary"
          }`}
        >
          <span
            className={`h-2 w-2 ${
              isDeficitBar ? "bg-status-deficit" : "bg-accent-primary"
            }`}
          />
          {isDeficitBar
            ? `Over by ${formatCurrency(
                Math.abs(metrics.simulatedSurplus),
                currencySymbol
              )}`
            : `Surplus ${surplusPct.toFixed(0)}%`}
        </span>
      </div>
    </div>
  );
}
