"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { downloadCsv, fmtPct, type CsvCell } from "@/lib/analytics-report";
import type { Tone } from "./charts";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] sm:p-6",
        className,
      )}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-on-surface">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary-dark",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/15 text-info",
};

export function StatCard({
  icon,
  label,
  value,
  hint,
  delta,
  invertDelta = false,
  tone = "primary",
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  /** Fractional change vs previous period (0.12 = +12%). `undefined` hides it. */
  delta?: number | null;
  /** When true, a decrease is good (e.g. cancellations). */
  invertDelta?: boolean;
  tone?: Tone;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-outline-variant bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            TONE_CHIP[tone],
          )}
        >
          <Icon name={icon} size={18} />
        </span>
        {delta !== undefined ? <DeltaBadge delta={delta} invert={invertDelta} /> : null}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
          {label}
        </p>
        <p className="truncate text-2xl leading-tight font-semibold tracking-tight text-on-surface tabular-nums">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 truncate text-xs text-on-surface-variant">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function DeltaBadge({ delta, invert }: { delta: number | null; invert: boolean }) {
  if (delta === null) {
    return (
      <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
        New
      </span>
    );
  }
  if (Math.abs(delta) < 0.0005) {
    return (
      <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
        No change
      </span>
    );
  }
  const up = delta > 0;
  const good = invert ? !up : up;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
        good ? "bg-success/15 text-success" : "bg-error/10 text-error",
      )}
    >
      <Icon name={up ? "arrow_upward" : "arrow_downward"} size={12} />
      {fmtPct(Math.abs(delta), Math.abs(delta) < 0.1 ? 1 : 0)}
    </span>
  );
}

export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-surface-container-low", className)} />
  );
}

type ResourceState<T> = {
  data: T | undefined;
  loading: boolean;
  error: string;
  refetch: () => void | Promise<void>;
};

/** Standard loading / error / ready switch shared by every report section. */
export function ReportState<T>({
  resource,
  skeleton,
  children,
}: {
  resource: ResourceState<T>;
  skeleton?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (resource.data !== undefined) {
    return <>{children(resource.data)}</>;
  }
  if (resource.error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
        <span>{resource.error}</span>
        <button
          type="button"
          onClick={() => void resource.refetch()}
          className="rounded-lg px-3 py-1.5 font-medium underline-offset-2 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }
  return <>{skeleton ?? <Skeleton className="h-48" />}</>;
}

export type TableColumn<Row> = {
  header: string;
  align?: "left" | "right";
  cell: (row: Row) => ReactNode;
  footer?: ReactNode;
};

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  empty = "Nothing to show for this period.",
}: {
  columns: Array<TableColumn<Row>>;
  rows: Row[];
  rowKey: (row: Row) => string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-outline-variant px-4 py-6 text-center text-sm text-on-surface-variant">
        {empty}
      </p>
    );
  }
  const hasFooter = columns.some((column) => column.footer !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-outline-variant text-left">
            {columns.map((column) => (
              <th
                key={column.header}
                className={cn(
                  "px-3 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap text-on-surface-variant uppercase",
                  column.align === "right" && "text-right",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-surface-container-low/60">
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={cn(
                    "px-3 py-2.5 text-on-surface tabular-nums",
                    column.align === "right" && "text-right",
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {hasFooter ? (
          <tfoot>
            <tr className="border-t border-outline-variant font-semibold">
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={cn(
                    "px-3 py-2.5 text-on-surface tabular-nums",
                    column.align === "right" && "text-right",
                  )}
                >
                  {column.footer}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

export function ExportButton({
  filename,
  rows,
  disabled,
}: {
  filename: string;
  rows: CsvCell[][];
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled || rows.length === 0}
      onClick={() => downloadCsv(filename, rows)}
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
    >
      <Icon name="download" size={18} />
      Export CSV
    </button>
  );
}

/** Short plain-language takeaways shown on the Overview tab. */
export function Insights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2.5">
      {items.map((text) => (
        <li key={text} className="flex items-start gap-2.5 text-sm text-on-surface">
          <Icon name="lightbulb" size={18} className="mt-0.5 shrink-0 text-warning" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
