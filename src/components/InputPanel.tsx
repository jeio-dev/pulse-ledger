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

  const wordCount =
    rawInput.trim().length > 0 ? rawInput.trim().split(/\s+/).length : 0;

  return (
    <section
      aria-label="Raw Statement Intake Console"
      className="border border-rule-hairline bg-paper-sheet"
    >
      {/* Structural Console Header */}
      <div className="flex items-baseline justify-between border-b border-rule-hairline bg-paper-base px-4 py-3">
        <div>
          <div className="type-micro-label text-ink-muted">
            SEC 01 // STATEMENT INTAKE
          </div>
          <h2 className="type-section-header mt-0.5 text-ink-primary">
            Monthly Brain-Dump
          </h2>
        </div>
        <span className="type-micro-label text-accent-primary">
          PLAIN-TEXT PARSER
        </span>
      </div>

      {/* Preset Scenario Accounting Index */}
      <div className="border-b border-rule-hairline">
        <div className="flex items-center justify-between border-b border-rule-hairline bg-paper-sheet px-4 py-2">
          <span className="type-micro-label text-ink-secondary">
            SPECIMEN SCENARIOS (1-CLICK LOAD)
          </span>
          <span className="type-micro-label text-ink-muted">INDEX 01–03</span>
        </div>

        <div className="divide-y divide-rule-hairline">
          {PRESET_SCENARIOS.map((preset, idx) => {
            const isSelected = rawInput.trim() === preset.rawInput.trim();
            const indexNumber = String(idx + 1).padStart(2, "0");

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`group relative flex w-full flex-col gap-1 px-4 py-3 text-left transition-opacity duration-180 ease-ledger-out ${
                  isSelected
                    ? "bg-paper-interactive"
                    : "bg-paper-sheet hover:bg-paper-interactive"
                }`}
              >
                {/* Active 2px Left Indicator Bar */}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] bg-accent-primary"
                  />
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className={`font-mono text-[11px] font-medium tabular-nums ${
                        isSelected ? "text-accent-primary" : "text-ink-muted"
                      }`}
                    >
                      {indexNumber}
                    </span>
                    <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-primary group-hover:text-accent-primary">
                      {preset.title}
                    </span>
                  </div>

                  <Badge variant={isSelected ? "emerald" : "default"}>
                    {preset.badgeText}
                  </Badge>
                </div>

                <p className="pl-6 text-[13px] leading-[1.45] text-ink-secondary line-clamp-1">
                  {preset.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Anchor: Brain-Dump Dispatch Sheet */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="cashflow-brain-dump"
            className="type-micro-label text-ink-secondary"
          >
            RAW INCOME &amp; EXPENSE STATEMENT
          </label>
          <span className="type-micro-label tabular-nums text-ink-muted">
            {wordCount > 0 ? `${wordCount} WORDS LOGGED` : "STANDBY // 0 WORDS"}
          </span>
        </div>

        <Textarea
          id="cashflow-brain-dump"
          value={rawInput}
          onChange={(e) => onRawInputChange(e.target.value)}
          placeholder="Paste or type a natural paragraph: I take home $2,600 a month. Rent is $1,150, utilities $185, groceries $340, rideshares $120, weekend takeout $240, and impulse shopping $130..."
          className="min-h-[196px]"
        />

        {/* Inline Unparseable / Error Hint */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 border border-status-caution/50 bg-status-caution/10 p-3 text-[13px] leading-[1.45] text-status-caution"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Execution Controls */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            onClick={() => onAnalyze()}
            disabled={isAnalyzeDisabled}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                PARSING STATEMENT...
              </>
            ) : (
              <>
                ANALYZE CASHFLOW
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
            CLEAR
          </Button>
        </div>
      </div>
    </section>
  );
}
