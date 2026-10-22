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
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Cashflow Allocation Split
          </h3>
          {isDeficitBar && (
            <Badge variant="rose" className="font-mono text-[10px]">
              <AlertTriangle className="h-2.5 w-2.5" />
              Spend Exceeds Income by{" "}
              {formatCurrency(Math.abs(metrics.simulatedSurplus), currencySymbol)}
            </Badge>
          )}
        </div>
        <span className="font-mono text-[11px] tabular-nums text-slate-400">
          {isDeficitBar || metrics.isExpenseOnlyMode
            ? "% of Simulated Total Spend"
            : "% of Monthly Income"}
        </span>
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-slate-800">
        {essentialPct > 0 && (
          <div
            style={{ width: `${essentialPct}%` }}
            className="h-full bg-slate-500 transition-all duration-75 first:rounded-l-full last:rounded-r-full"
            title={`Fixed Essentials: ${essentialPct.toFixed(1)}%`}
          />
        )}
        {flexiblePct > 0 && (
          <div
            style={{ width: `${flexiblePct}%` }}
            className="h-full bg-sky-500 transition-all duration-75 first:rounded-l-full last:rounded-r-full"
            title={`Flexible Living: ${flexiblePct.toFixed(1)}%`}
          />
        )}
        {wantPct > 0 && (
          <div
            style={{ width: `${wantPct}%` }}
            className="h-full bg-violet-500 transition-all duration-75 first:rounded-l-full last:rounded-r-full"
            title={`Discretionary Wants: ${wantPct.toFixed(1)}%`}
          />
        )}
        {surplusPct > 0 && (
          <div
            style={{ width: `${surplusPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-75 first:rounded-l-full last:rounded-r-full"
            title={`Remaining Surplus: ${surplusPct.toFixed(1)}%`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
            <span className="text-slate-300">Essentials</span>
          </div>
          <span className="font-mono font-medium tabular-nums text-slate-200">
            {essentialPct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
            <span className="text-slate-300">Flexible</span>
          </div>
          <span className="font-mono font-medium tabular-nums text-sky-400">
            {flexiblePct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
            <span className="text-slate-300">Wants</span>
          </div>
          <span className="font-mono font-medium tabular-nums text-violet-400">
            {wantPct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-sm ${
                isDeficitBar ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
            <span className="text-slate-300">
              {isDeficitBar ? "Deficit" : "Surplus"}
            </span>
          </div>
          <span
            className={`font-mono font-medium tabular-nums ${
              isDeficitBar ? "text-rose-400" : "text-emerald-400"
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
