"use client";

import * as React from "react";
import { Sparkles, RotateCcw, AlertCircle, Loader2, Terminal } from "lucide-react";
import { PRESET_SCENARIOS, type PresetScenario } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface InputPanelProps {
  rawInput: string;
  onRawInputChange: (value: string) => void;
  onAnalyze: (inputToParse?: string) => void;
  onClearAll: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  hasActiveLedger: boolean;
}

export function InputPanel({
  rawInput,
  onRawInputChange,
  onAnalyze,
  onClearAll,
  isLoading,
  errorMessage,
  hasActiveLedger,
}: InputPanelProps) {
  const isAnalyzeDisabled = isLoading || rawInput.trim().length === 0;

  const handleSelectPreset = (preset: PresetScenario) => {
    onRawInputChange(preset.rawInput);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">
            Monthly Brain-Dump
          </h2>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Plain-English Input
        </span>
      </div>

      {/* Preset Scenario Pills */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">
          1-Click Realistic Scenarios
        </label>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected =
              rawInput.trim() === preset.rawInput.trim();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`group flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-all ${
                  isSelected
                    ? "border-emerald-500/60 bg-emerald-500/10 text-slate-100"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {preset.title}
                  </span>
                  <Badge
                    variant={isSelected ? "emerald" : "default"}
                    className="font-mono tabular-nums text-[10px] px-1.5 py-0"
                  >
                    {preset.badgeText}
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1">
                  {preset.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brain-Dump Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="cashflow-brain-dump"
            className="text-xs font-medium text-slate-300"
          >
            Income & Expense Paragraph
          </label>
          <span className="font-mono text-[11px] tabular-nums text-slate-500">
            {rawInput.trim().length > 0
              ? `${rawInput.trim().split(/\s+/).length} words`
              : "Empty"}
          </span>
        </div>
        <Textarea
          id="cashflow-brain-dump"
          value={rawInput}
          onChange={(e) => onRawInputChange(e.target.value)}
          placeholder="Example: I take home $2,600 a month. Rent is $1,150, utilities $185, groceries $340, rideshares $120, weekend takeout $240, and impulse shopping $130..."
          className="min-h-[190px] font-sans text-sm"
        />
      </div>

      {/* Inline Unparseable / Error Hint */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-1">
        <Button
          type="button"
          onClick={() => onAnalyze()}
          disabled={isAnalyzeDisabled}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Cashflow...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Cashflow
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onClearAll}
          disabled={isLoading || (!hasActiveLedger && rawInput.length === 0)}
          title="Clear input and reset workspace"
        >
          <RotateCcw className="h-4 w-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
