import * as React from "react";
import { Sliders, ShieldCheck, Zap, ArrowLeft } from "lucide-react";

export function ReadyEmptyState() {
  return (
    <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        <Sliders className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight text-slate-100">
        Ready to Analyze Cashflow
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        Paste a messy plain-English summary of your month&apos;s income and
        spending on the left—or click one of the 3 preset scenarios—then hit{" "}
        <span className="font-medium text-emerald-400">Analyze Cashflow</span>.
      </p>

      <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800/90 bg-slate-950/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>1. Brain-Dump</span>
          </div>
          <p className="mt-1 text-[11px] leading-normal text-slate-400">
            No spreadsheet rows or manual dropdowns. Type natural sentences.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800/90 bg-slate-950/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>2. Daily Burn Math</span>
          </div>
          <p className="mt-1 text-[11px] leading-normal text-slate-400">
            Compare Safe Daily Allowance after fixed bills vs. Actual Daily Spend.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800/90 bg-slate-950/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Sliders className="h-3.5 w-3.5 text-violet-400" />
            <span>3. What-If Sliders</span>
          </div>
          <p className="mt-1 text-[11px] leading-normal text-slate-400">
            Scrub 0%–150% sliders on non-fixed expenses to flip deficit to surplus.
          </p>
        </div>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
        <ArrowLeft className="h-3.5 w-3.5 text-emerald-400" />
        <span>Select &ldquo;Post-Payday Squeeze&rdquo; on the left to try it in 1 click</span>
      </div>
    </div>
  );
}
