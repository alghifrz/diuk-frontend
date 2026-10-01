"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import {
  businessToday,
  formatBusinessDateLabel,
  shiftBusinessDate,
} from "@/lib/business-time";
import type { ReservationStatus } from "@/types/reservation";

const STATUSES: Array<ReservationStatus | ""> = [
  "",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

type ReservationFiltersProps = {
  date: string;
  timezone: string;
  status: ReservationStatus | "";
  search: string;
  onDateChange: (date: string) => void;
  onStatusChange: (status: ReservationStatus | "") => void;
  onSearchChange: (search: string) => void;
};

export function ReservationFilters({
  date,
  timezone,
  status,
  search,
  onDateChange,
  onStatusChange,
  onSearchChange,
}: ReservationFiltersProps) {
  const today = businessToday(timezone);

  return (
    <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-xl border border-outline-variant bg-background p-0.5">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => onDateChange(shiftBusinessDate(date, -1, timezone))}
            className="inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <button
            type="button"
            onClick={() => onDateChange(today)}
            className={cn(
              "min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              date === today
                ? "bg-primary text-white"
                : "text-on-surface hover:bg-surface",
            )}
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => onDateChange(shiftBusinessDate(date, 1, timezone))}
            className="inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </div>

        <label className="relative inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant bg-background px-3 text-sm text-on-surface">
          <Icon name="calendar_today" size={18} className="text-on-surface-variant" />
          <span className="font-medium">{formatBusinessDateLabel(date, timezone)}</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Pick date"
          />
        </label>

        <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant bg-background px-3 text-sm text-on-surface">
          <span className="text-on-surface-variant">Status</span>
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as ReservationStatus | "")
            }
            className="bg-transparent font-medium outline-none focus-visible:ring-0"
            aria-label="Filter by status"
          >
            {STATUSES.map((value) => (
              <option key={value || "all"} value={value}>
                {value || "All"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="relative block">
        <span className="sr-only">Search loaded reservations</span>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
          <Icon name="search" size={18} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Filter by customer name or phone"
          className="min-h-10 w-full rounded-xl border border-outline-variant bg-background py-2 pl-10 pr-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </label>
    </div>
  );
}
