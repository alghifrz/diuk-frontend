"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { formatMenuPrice } from "@/lib/format-price";
import type { AnalyticsRevenueDay } from "@/types/analytics";
import { AnimatedNumber, EASE_OUT } from "./motion-kit";

type Mode = "daily" | "cumulative";

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "daily", label: "Daily" },
  { id: "cumulative", label: "Running total" },
];

function toAmount(raw: number | string) {
  return typeof raw === "number"
    ? raw
    : Number(String(raw).replace(/,/g, "")) || 0;
}

function dayLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Interactive bar chart: hover/focus a day to read it, toggle daily vs running total. */
export function RevenueChart({
  series,
  currency,
}: {
  series: AnalyticsRevenueDay[];
  currency: string;
}) {
  const [mode, setMode] = useState<Mode>("daily");
  const [active, setActive] = useState<number | null>(null);

  const values = useMemo(() => {
    const daily = series.map((day) => toAmount(day.paid_amount));
    if (mode === "daily") return daily;
    let running = 0;
    return daily.map((amount) => (running += amount));
  }, [series, mode]);

  const max = Math.max(...values, 1);
  const total = values.length
    ? mode === "daily"
      ? values.reduce((sum, value) => sum + value, 0)
      : values[values.length - 1]
    : 0;
  const shown = active !== null ? (values[active] ?? 0) : total;
  const caption =
    active !== null
      ? dayLabel(series[active]?.date ?? "")
      : mode === "daily"
        ? "This month"
        : "Month to date";

  return (
    <div className="mt-5 rounded-2xl border border-outline-variant bg-background/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={caption}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="font-mono text-[10px] tracking-[0.14em] text-on-surface-variant uppercase"
            >
              {caption}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-on-surface tabular-nums">
            <AnimatedNumber
              value={shown}
              duration={0.45}
              format={(n) => formatMenuPrice(Math.round(n), currency)}
            />
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Chart mode"
          className="relative inline-flex rounded-xl bg-surface-container-low p-1"
        >
          {MODES.map((item) => {
            const selected = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMode(item.id)}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selected
                    ? "text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId="revenue-mode-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-4 flex h-28 items-end gap-1.5"
        onMouseLeave={() => setActive(null)}
      >
        {series.map((day, index) => {
          const value = values[index] ?? 0;
          const pct = Math.max(6, Math.round((value / max) * 100));
          const isActive = active === index;
          return (
            <button
              key={day.date}
              type="button"
              aria-label={`${dayLabel(day.date)}: ${formatMenuPrice(value, currency)}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className="group flex h-full min-w-5 flex-1 items-end rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <motion.span
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: `${pct}%`,
                  opacity: active === null || isActive ? 1 : 0.45,
                }}
                transition={{
                  height: {
                    type: "spring",
                    stiffness: 140,
                    damping: 20,
                    delay: Math.min(index, 20) * 0.025,
                  },
                  opacity: { duration: 0.2, ease: EASE_OUT },
                }}
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  isActive ? "bg-primary-dark" : "bg-primary/80",
                )}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {series.map((day, index) => (
          <span
            key={day.date}
            className={cn(
              "min-w-5 flex-1 text-center font-mono text-[9px] transition-colors",
              active === index
                ? "font-semibold text-on-surface"
                : "text-on-surface-variant",
            )}
          >
            {day.date.slice(8)}
          </span>
        ))}
      </div>
    </div>
  );
}
