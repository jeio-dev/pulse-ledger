import * as React from "react";
import { ArrowLeft } from "lucide-react";

export function ReadyEmptyState() {
  return (
    <section
      aria-label="Standby Ledger Specimen"
      className="border border-rule-hairline bg-paper-sheet"
    >
      {/* Top Structural Band */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule-hairline bg-paper-base px-5 py-3">
        <span className="type-micro-label text-ink-muted">
          SEC 02 // STANDBY SPECIMEN — AWAITING STATEMENT INPUT
        </span>
        <span className="type-micro-label text-accent-primary">
          30-DAY BURN EQUATION READY
        </span>
      </div>

      {/* Asymmetric 7 : 5 Editorial Split */}
      <div className="grid grid-cols-1 divide-y divide-rule-hairline lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        {/* Left 7 Columns: Typographic Manifesto & Mathematical Specification */}
        <div className="flex flex-col justify-between p-6 lg:col-span-7">
          <div>
            <div className="type-micro-label text-accent-primary">
              OPERATING PROTOCOL
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.025em] text-ink-primary">
              Stop categorizing spreadsheets row by row. Audit your true daily burn in 60 seconds.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-secondary">
              Traditional budgets fail because fixed rent and variable takeout get lumped into a single monthly total. PulseLedger isolates non-negotiable obligations first, then computes your exact{" "}
              <span className="font-medium text-ink-primary">
                Safe Daily Allowance
              </span>{" "}
              for the remaining 30 days.
            </p>

            {/* Mathematical Formula Block */}
            <div className="mt-6 border border-rule-hairline bg-paper-base p-4">
              <div className="flex items-center justify-between border-b border-rule-hairline pb-2">
                <span className="type-micro-label text-ink-secondary">
                  CORE TRIAGE FORMULAS (30-DAY STANDARD)
                </span>
                <span className="type-micro-label text-ink-muted">
                  TABULAR-NUMS
                </span>
              </div>
              <dl className="mt-3 space-y-2.5 font-mono text-xs tabular-nums">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                  <dt className="text-ink-secondary">SAFE DAILY ALLOWANCE</dt>
                  <dd className="font-semibold text-accent-primary">
                    (Monthly Income − Fixed Essentials) ÷ 30
                  </dd>
                </div>
                <div className="flex flex-col justify-between gap-1 border-t border-rule-hairline/70 pt-2 sm:flex-row sm:items-baseline">
                  <dt className="text-ink-secondary">ACTUAL DAILY BURN</dt>
                  <dd className="font-semibold text-ink-primary">
                    (Flexible Living + Discretionary Wants) ÷ 30
                  </dd>
                </div>
              </dl>
            </div>

            {/* 3-Step Vertical Accounting Index (Replaces Banned 3-Card Grid) */}
            <div className="mt-6 divide-y divide-rule-hairline border-t border-b border-rule-hairline">
              <div className="grid grid-cols-12 items-baseline gap-3 py-3">
                <span className="col-span-2 font-mono text-xs font-semibold text-accent-primary">
                  STEP 01
                </span>
                <div className="col-span-10">
                  <div className="font-display text-sm font-semibold text-ink-primary">
                    Natural Statement Intake
                  </div>
                  <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-secondary">
                    Paste a messy paragraph of income and bills—or load a specimen preset on the left.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline gap-3 py-3">
                <span className="col-span-2 font-mono text-xs font-semibold text-accent-primary">
                  STEP 02
                </span>
                <div className="col-span-10">
                  <div className="font-display text-sm font-semibold text-ink-primary">
                    Locked Fixed vs. Adjustable Variable Split
                  </div>
                  <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-secondary">
                    Fixed Essentials lock at 100% so you cannot cheat rent; variable buckets unlock for triage.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 items-baseline gap-3 py-3">
                <span className="col-span-2 font-mono text-xs font-semibold text-accent-primary">
                  STEP 03
                </span>
                <div className="col-span-10">
                  <div className="font-display text-sm font-semibold text-ink-primary">
                    Real-Time 0%–150% What-If Scrubbing
                  </div>
                  <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-secondary">
                    Drag individual line items to flip daily burn from deficit to surplus and export Markdown cuts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 font-mono text-xs text-ink-secondary">
            <ArrowLeft className="h-3.5 w-3.5 text-accent-primary" />
            <span>
              SELECT <strong className="text-ink-primary">01 / POST-PAYDAY SQUEEZE</strong> ON THE LEFT CONSOLE TO BEGIN
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Real Archival Editorial Plate & Live Specimen Receipt */}
        <div className="flex flex-col justify-between bg-paper-base p-5 lg:col-span-5">
          {/* Curated Archival Photograph Plate */}
          <figure className="border border-rule-hairline bg-paper-sheet">
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-rule-hairline bg-paper-base">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85"
                alt="Archival close-up of physical financial ledger statement and mechanical accounting keypads"
                loading="eager"
                className="h-full w-full object-cover grayscale contrast-125 brightness-75"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-rule-hairline bg-paper-base/90 px-3 py-1.5">
                <span className="type-micro-label text-ink-secondary">
                  FIG 1.0 // LEDGER INSTRUMENT
                </span>
                <span className="type-micro-label text-accent-primary">
                  SCALE 1:1
                </span>
              </div>
            </div>
            <figcaption className="px-3.5 py-2.5 text-[12px] leading-[1.45] text-ink-secondary">
              Physical accounting discipline applied to personal burn: fixed obligations are deducted prior to computing daily variable capacity.
            </figcaption>
          </figure>

          {/* Reference Calibration Specimen Table */}
          <div className="mt-5 border border-rule-hairline bg-paper-sheet">
            <div className="flex items-center justify-between border-b border-rule-hairline px-3.5 py-2">
              <span className="type-micro-label text-ink-secondary">
                CALIBRATION SPECIMEN // #PL-01
              </span>
              <span className="type-micro-label text-status-deficit">
                -$2.83/DAY OVER
              </span>
            </div>

            <div className="divide-y divide-rule-hairline px-3.5 font-mono text-xs tabular-nums">
              <div className="flex items-center justify-between py-2">
                <span className="text-ink-secondary">01. NET MONTHLY TAKE-HOME</span>
                <span className="font-semibold text-ink-primary">$2,600.00</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-ink-secondary">02. LOCKED FIXED ESSENTIALS</span>
                <span className="text-ink-primary">−$1,600.00</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-ink-secondary">03. 30-DAY SAFE ALLOWANCE</span>
                <span className="font-semibold text-accent-primary">$33.33 / DAY</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-ink-secondary">04. BASELINE VARIABLE BURN</span>
                <span className="font-semibold text-status-deficit">$36.17 / DAY</span>
              </div>
            </div>

            <div className="border-t border-rule-hairline bg-paper-base px-3.5 py-2 font-mono text-[11px] text-ink-muted">
              TARGET LEVERAGE: TRIMMING $85/MO IN WANTS RESTORES +$0.00/DAY EQUILIBRIUM.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
