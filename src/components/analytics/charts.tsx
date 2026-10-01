"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { fmtInt, fmtPct, ratio } from "@/lib/analytics-report";

export type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "info";

const TONE_BG: Record<Tone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

const TONE_TEXT: Record<Tone, string> = {
  primary: "text-primary-dark",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  info: "text-info",
};

export function toneBg(tone: Tone) {
  return TONE_BG[tone];
}

function labelStep(count: number, target = 8) {
  return Math.max(1, Math.ceil(count / target));
}

function Gridlines() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
      {[0, 1, 2].map((line) => (
        <div key={line} className="border-t border-dashed border-outline-variant/70" />
      ))}
      <div className="border-t border-outline-variant" />
    </div>
  );
}

export type BarDatum = { label: string; value: number; axis?: string };

/** Simple column chart. Hover or focus a column to read its exact value. */
export function BarChart({
  data,
  format = fmtInt,
  height = 168,
  tone = "primary",
}: {
  data: BarDatum[];
  format?: (value: number) => string;
  height?: number;
  tone?: Tone;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...data.map((item) => item.value));
  const step = labelStep(data.length);
  const current = active !== null ? data[active] : null;

  return (
    <div>
      <p className="h-5 truncate text-xs text-on-surface-variant tabular-nums">
        {current ? (
          <>
            <span className="font-semibold text-on-surface">{format(current.value)}</span>
            <span> · {current.label}</span>
          </>
        ) : max > 0 ? (
          <>Peak {format(max)}</>
        ) : (
          "No activity in this period"
        )}
      </p>
      <div
        className="relative mt-2"
        style={{ height }}
        onMouseLeave={() => setActive(null)}
      >
        <Gridlines />
        <div className="absolute inset-0 flex items-end gap-px sm:gap-0.5">
          {data.map((item, index) => {
            const pct = max > 0 ? (item.value / max) * 100 : 0;
            const isActive = active === index;
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                aria-label={`${item.label}: ${format(item.value)}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="flex h-full min-w-0 flex-1 items-end focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-200",
                    TONE_BG[tone],
                    active === null || isActive ? "opacity-90" : "opacity-40",
                    isActive && "opacity-100",
                  )}
                  style={{
                    height: item.value > 0 ? `max(${pct}%, 3px)` : "0px",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-px sm:gap-0.5">
        {data.map((item, index) => (
          <span
            key={`${item.label}-${index}`}
            className="min-w-0 flex-1 overflow-visible text-center font-mono text-[9px] whitespace-nowrap text-on-surface-variant"
          >
            {index % step === 0 ? (item.axis ?? item.label) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export type StackedDatum = { label: string; axis?: string; parts: number[] };

/** Stacked columns (e.g. reservations per day split by status). */
export function StackedBars({
  data,
  series,
  height = 168,
}: {
  data: StackedDatum[];
  series: Array<{ label: string; tone: Tone }>;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const totals = data.map((item) => item.parts.reduce((sum, part) => sum + part, 0));
  const max = Math.max(0, ...totals);
  const step = labelStep(data.length);
  const current = active !== null ? data[active] : null;

  return (
    <div>
      <div className="flex min-h-5 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="truncate text-xs text-on-surface-variant tabular-nums">
          {current ? (
            <>
              <span className="font-semibold text-on-surface">
                {fmtInt(totals[active ?? 0] ?? 0)}
              </span>
              <span>
                {" "}
                · {current.label} (
                {series
                  .map((entry, i) => `${fmtInt(current.parts[i] ?? 0)} ${entry.label.toLowerCase()}`)
                  .join(", ")}
                )
              </span>
            </>
          ) : max > 0 ? (
            <>Peak {fmtInt(max)} in a day</>
          ) : (
            "No activity in this period"
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-on-surface-variant">
          {series.map((entry) => (
            <span key={entry.label} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", TONE_BG[entry.tone])} />
              {entry.label}
            </span>
          ))}
        </div>
      </div>
      <div
        className="relative mt-2"
        style={{ height }}
        onMouseLeave={() => setActive(null)}
      >
        <Gridlines />
        <div className="absolute inset-0 flex items-end gap-px sm:gap-0.5">
          {data.map((item, index) => {
            const total = totals[index] ?? 0;
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                aria-label={`${item.label}: ${fmtInt(total)}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="flex h-full min-w-0 flex-1 items-end focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "flex w-full flex-col-reverse overflow-hidden rounded-t-sm transition-opacity duration-200",
                    active === null || active === index ? "opacity-100" : "opacity-40",
                  )}
                  style={{
                    height: total > 0 && max > 0 ? `max(${(total / max) * 100}%, 3px)` : "0px",
                  }}
                >
                  {item.parts.map((part, i) =>
                    part > 0 ? (
                      <span
                        key={i}
                        className={TONE_BG[series[i]?.tone ?? "primary"]}
                        style={{ height: `${(part / total) * 100}%` }}
                      />
                    ) : null,
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-px sm:gap-0.5">
        {data.map((item, index) => (
          <span
            key={`${item.label}-${index}`}
            className="min-w-0 flex-1 overflow-visible text-center font-mono text-[9px] whitespace-nowrap text-on-surface-variant"
          >
            {index % step === 0 ? (item.axis ?? item.label) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export type BarListItem = {
  label: string;
  value: number;
  hint?: string;
  tone?: Tone;
};

/** Horizontal ranked bars for breakdowns (channel, status, area…). */
export function BarList({
  items,
  format = fmtInt,
  tone = "primary",
  empty = "Nothing to show for this period.",
  showShare = false,
}: {
  items: BarListItem[];
  format?: (value: number) => string;
  tone?: Tone;
  empty?: string;
  showShare?: boolean;
}) {
  const max = Math.max(0, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (items.length === 0 || max === 0) {
    return <EmptyNote>{empty}</EmptyNote>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-on-surface">{item.label}</span>
            <span className="shrink-0 font-semibold text-on-surface tabular-nums">
              {format(item.value)}
              {showShare ? (
                <span className="ml-1.5 text-xs font-normal text-on-surface-variant">
                  {fmtPct(ratio(item.value, total))}
                </span>
              ) : null}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-low">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                TONE_BG[item.tone ?? tone],
              )}
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
          {item.hint ? (
            <p className="mt-1 text-xs text-on-surface-variant">{item.hint}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Circular gauge for a 0–1 rate. */
export function Ring({
  value,
  label,
  tone = "primary",
  size = 96,
}: {
  value: number;
  label: string;
  tone?: Tone;
  size?: number;
}) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const radius = 15.9155;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            strokeWidth="3.4"
            className="stroke-surface-container-low"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeDasharray={`${clamped * 100} 100`}
            className={cn("stroke-current transition-all duration-700", TONE_TEXT[tone])}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-semibold text-on-surface tabular-nums">
          {fmtPct(clamped)}
        </span>
      </div>
      <p className="text-center text-xs text-on-surface-variant">{label}</p>
    </div>
  );
}

export type FunnelStep = { label: string; value: number; hint?: string };

/** Descending funnel with step-to-step conversion. */
export function Funnel({
  steps,
  tone = "primary",
}: {
  steps: FunnelStep[];
  tone?: Tone;
}) {
  const top = Math.max(0, ...steps.map((step) => step.value));
  if (top === 0) {
    return <EmptyNote>No activity in this period yet.</EmptyNote>;
  }
  return (
    <ol className="space-y-2.5">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1].value : null;
        return (
          <li key={step.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-on-surface">{step.label}</span>
              <span className="shrink-0 font-semibold text-on-surface tabular-nums">
                {fmtInt(step.value)}
                {prev !== null && prev > 0 ? (
                  <span className="ml-1.5 text-xs font-normal text-on-surface-variant">
                    {fmtPct(ratio(step.value, prev))} of previous
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-1.5 h-6 overflow-hidden rounded-lg bg-surface-container-low">
              <div
                className={cn("h-full rounded-lg transition-all duration-500", TONE_BG[tone])}
                style={{
                  width: `${Math.max(step.value > 0 ? 2 : 0, (step.value / top) * 100)}%`,
                  opacity: 1 - index * 0.12,
                }}
              />
            </div>
            {step.hint ? (
              <p className="mt-1 text-xs text-on-surface-variant">{step.hint}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-outline-variant px-4 py-6 text-center text-sm text-on-surface-variant">
      {children}
    </p>
  );
}
