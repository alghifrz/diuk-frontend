"use client";

import { cn } from "@/lib/cn";
import {
  MAX_RANGE_DAYS,
  RANGE_PRESETS,
  isValidRange,
  rangeDays,
  type DateRange,
  type RangePreset,
} from "@/lib/analytics-report";

export function RangePicker({
  preset,
  onPresetChange,
  custom,
  onCustomChange,
  max,
}: {
  preset: RangePreset;
  onPresetChange: (preset: RangePreset) => void;
  custom: DateRange;
  onCustomChange: (range: DateRange) => void;
  /** Latest selectable day (today in the business timezone). */
  max: string;
}) {
  const customInvalid = preset === "custom" && !isValidRange(custom);
  const tooLong = preset === "custom" && custom.from <= custom.to && rangeDays(custom) > MAX_RANGE_DAYS;

  return (
    <div className="flex min-w-0 flex-col gap-2 lg:items-end">
      <div
        role="radiogroup"
        aria-label="Date range"
        className="flex max-w-full flex-wrap gap-1 rounded-xl bg-surface-container-low p-1"
      >
        {RANGE_PRESETS.map((item) => {
          const selected = item.id === preset;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPresetChange(item.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "bg-surface text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {preset === "custom" ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="sr-only" htmlFor="analytics-from">
            From
          </label>
          <input
            id="analytics-from"
            type="date"
            value={custom.from}
            max={custom.to || max}
            onChange={(event) => onCustomChange({ ...custom, from: event.target.value })}
            className="min-h-10 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <span className="text-on-surface-variant">to</span>
          <label className="sr-only" htmlFor="analytics-to">
            To
          </label>
          <input
            id="analytics-to"
            type="date"
            value={custom.to}
            min={custom.from}
            max={max}
            onChange={(event) => onCustomChange({ ...custom, to: event.target.value })}
            className="min-h-10 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      ) : null}

      {customInvalid ? (
        <p className="text-xs text-error">
          {tooLong
            ? `Pick a range of at most ${MAX_RANGE_DAYS} days.`
            : "Pick a valid start and end date."}
        </p>
      ) : null}
    </div>
  );
}
