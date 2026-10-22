"use client";

import * as React from "react";
import { RotateCcw, AlertCircle, Loader2, ArrowUpRight } from "lucide-react";
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
    <section
      aria-label="Monthly Cashflow Input"
      className="border border-rule-hairline bg-paper-sheet"
    >
      <div className="flex items-center justify-between border-b border-rule-hairline bg-paper-base px-4 py-3">
        <h2 className="type-section-header text-ink-primary">
          Monthly Cashflow
        </h2>
        <span className="text-xs text-ink-muted">Plain English</span>
      </div>

      <div className="space-y-4 p-4">
        {/* Compact Preset Buttons */}
        <div className="space-y-1.5">
          <div className="text-xs text-ink-secondary">Presets</div>
          <div className="grid grid-cols-1 gap-1.5">
            {PRESET_SCENARIOS.map((preset) => {
              const isSelected = rawInput.trim() === preset.rawInput.trim();

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center justify-between border px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "border-accent-primary bg-accent-primary/10 text-ink-primary"
                      : "border-rule-hairline bg-paper-base text-ink-secondary hover:bg-paper-interactive hover:text-ink-primary"
                  }`}
                >
                  <span className="font-medium text-ink-primary">
                    {preset.title}
                  </span>
                  <Badge variant={isSelected ? "emerald" : "default"}>
                    {preset.badgeText}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brain-Dump Textarea */}
        <div>
          <label htmlFor="cashflow-brain-dump" className="sr-only">
            Income and expenses summary
          </label>
          <Textarea
            id="cashflow-brain-dump"
            value={rawInput}
            onChange={(e) => onRawInputChange(e.target.value)}
            placeholder="e.g. I take home $2,600/mo. Rent is $1,150, utilities $185, groceries $340, takeout $240, subscriptions $65..."
            className="min-h-[160px] text-sm"
          />
        </div>

        {/* Inline Error Hint */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-status-caution/50 bg-status-caution/10 p-2.5 text-xs text-status-caution"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Execution Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => onAnalyze()}
            disabled={isAnalyzeDisabled}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Cashflow
                <ArrowUpRight className="h-3.5 w-3.5" />
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
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </section>
  );
}
