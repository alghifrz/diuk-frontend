import type { Money } from "@/types/analytics";

/* ------------------------------------------------------------------ */
/* Date ranges (all YYYY-MM-DD, interpreted in the business timezone)  */
/* ------------------------------------------------------------------ */

export type RangePreset = "7d" | "30d" | "90d" | "month" | "last_month" | "custom";

export const RANGE_PRESETS: Array<{ id: RangePreset; label: string }> = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "custom", label: "Custom" },
];

export const MAX_RANGE_DAYS = 366;

export type DateRange = { from: string; to: string };

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

function formatYmd(ms: number) {
  const date = new Date(ms);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function shiftYmd(ymd: string, days: number) {
  return formatYmd(parseYmd(ymd) + days * 86_400_000);
}

/** Inclusive number of days in a range. */
export function rangeDays(range: DateRange) {
  return Math.round((parseYmd(range.to) - parseYmd(range.from)) / 86_400_000) + 1;
}

export function eachDay(range: DateRange) {
  const days: string[] = [];
  for (let i = 0, n = rangeDays(range); i < n; i += 1) {
    days.push(shiftYmd(range.from, i));
  }
  return days;
}

export function resolveRange(
  preset: RangePreset,
  today: string,
  custom?: DateRange,
): DateRange {
  switch (preset) {
    case "7d":
      return { from: shiftYmd(today, -6), to: today };
    case "30d":
      return { from: shiftYmd(today, -29), to: today };
    case "90d":
      return { from: shiftYmd(today, -89), to: today };
    case "month":
      return { from: `${today.slice(0, 8)}01`, to: today };
    case "last_month": {
      const firstThis = `${today.slice(0, 8)}01`;
      const lastDayPrev = shiftYmd(firstThis, -1);
      return { from: `${lastDayPrev.slice(0, 8)}01`, to: lastDayPrev };
    }
    case "custom":
      return custom ?? { from: shiftYmd(today, -29), to: today };
  }
}

/** The window of equal length immediately before `range`. */
export function previousRange(range: DateRange): DateRange {
  const days = rangeDays(range);
  return { from: shiftYmd(range.from, -days), to: shiftYmd(range.from, -1) };
}

export function isValidRange(range: DateRange) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range.from)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range.to)) return false;
  const days = rangeDays(range);
  return days >= 1 && days <= MAX_RANGE_DAYS;
}

export function shortDay(ymd: string) {
  const date = new Date(parseYmd(ymd));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function rangeLabel(range: DateRange) {
  const fromYear = range.from.slice(0, 4);
  const toYear = range.to.slice(0, 4);
  const from = shortDay(range.from);
  const to = shortDay(range.to);
  if (range.from === range.to) return `${to} ${toYear}`;
  return fromYear === toYear
    ? `${from} – ${to} ${toYear}`
    : `${from} ${fromYear} – ${to} ${toYear}`;
}

/** Align sparse API day rows onto every day of the range (missing → 0). */
export function fillDays<T extends { date: string }>(
  range: DateRange,
  rows: T[] | null | undefined,
  empty: (date: string) => T,
): T[] {
  const byDate = new Map((rows ?? []).map((row) => [row.date.slice(0, 10), row]));
  return eachDay(range).map((date) => byDate.get(date) ?? empty(date));
}

/* ------------------------------------------------------------------ */
/* Number formatting                                                   */
/* ------------------------------------------------------------------ */

export function toNum(raw: Money | null | undefined) {
  if (raw === null || raw === undefined) return 0;
  return typeof raw === "number"
    ? raw
    : Number(String(raw).replace(/,/g, "")) || 0;
}

export function fmtInt(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

/** `0.1234` → `12.3%` (the API returns rates as 0–1 fractions). */
export function fmtPct(fraction: number, digits = 0) {
  if (!Number.isFinite(fraction)) return "–";
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function fmtDecimal(value: number, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "–";
}

export function fmtDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return "–";
  }
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) {
    const rest = total % 60;
    return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return rest ? `${days}d ${rest}h` : `${days}d`;
}

export function fmtLatency(ms: number | null | undefined) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "–";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

export function ratio(part: number, total: number) {
  return total > 0 ? part / total : 0;
}

/** `HUMAN_REQUESTED` → `Human requested`. */
export function humanize(key: string) {
  if (!key) return "Unknown";
  const text = key.replace(/[_-]+/g, " ").trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** Change vs the previous period. `null` when there is no baseline to compare. */
export function deltaPct(current: number, previous: number | null | undefined) {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

/* ------------------------------------------------------------------ */
/* CSV export                                                          */
/* ------------------------------------------------------------------ */

export type CsvCell = string | number | null | undefined;

function csvCell(value: CsvCell) {
  const text = value === null || value === undefined ? "" : String(value);
  // Guard against spreadsheet formula injection from user-controlled labels.
  const safe = /^[=+\-@\t\r]/.test(text) && Number.isNaN(Number(text)) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function buildCsv(rows: CsvCell[][]) {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function downloadCsv(filename: string, rows: CsvCell[][]) {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
