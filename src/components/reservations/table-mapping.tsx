"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { FloorArea } from "@/hooks/use-floor-plan";
import {
  businessLocalToDate,
  businessToday,
  formatBusinessTime,
} from "@/lib/business-time";
import { cn } from "@/lib/cn";
import type { DiningTable } from "@/types/area";
import type { CalendarDayEvent, CalendarDayView } from "@/types/reservation";

type TableMappingProps = {
  floor: FloorArea[];
  floorLoading: boolean;
  floorError: string;
  onRetryFloor: () => void;
  day: CalendarDayView | null;
  dayLoading: boolean;
  dayError: string;
  onRetryDay: () => void;
  date: string;
  timezone: string;
  selectedId: string | null;
  onSelect: (reservationId: string) => void;
};

type TableState = "free" | "reserved" | "occupied" | "blocked";

/** Only live bookings hold a table; cancelled and completed ones release it. */
const HOLDING_STATUSES = new Set(["PENDING", "CONFIRMED"]);

const STATE_LABEL: Record<TableState, string> = {
  free: "Free",
  reserved: "Reserved",
  occupied: "Occupied",
  blocked: "Blocked",
};

const STATE_STYLES: Record<TableState, { tile: string; pill: string }> = {
  free: {
    tile: "border-success/30 bg-success/5",
    pill: "bg-success/15 text-success",
  },
  reserved: {
    tile: "border-warning/40 bg-warning/5",
    pill: "bg-warning/15 text-warning",
  },
  occupied: {
    tile: "border-error/40 bg-error/5",
    pill: "bg-error/10 text-error",
  },
  blocked: {
    tile: "border-outline-variant bg-surface-container-low",
    pill: "bg-on-surface-variant/10 text-on-surface-variant",
  },
};

function toHm(value: string) {
  return value.slice(0, 5);
}

function toMinutes(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Half-hour options between the earliest open and latest close time. */
function buildTimeOptions(day: CalendarDayView | null): string[] {
  const hours = day?.hours ?? [];
  let start = 8 * 60;
  let end = 22 * 60;
  if (hours.length > 0) {
    start = Math.min(...hours.map((h) => toMinutes(toHm(h.open_time))));
    end = Math.max(...hours.map((h) => toMinutes(toHm(h.close_time))));
  }
  const out: string[] = [];
  for (let t = Math.floor(start / 30) * 30; t < end; t += 30) {
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return out;
}

function covers(event: CalendarDayEvent, atMs: number) {
  return (
    new Date(event.start_at).getTime() <= atMs &&
    atMs < new Date(event.end_at).getTime()
  );
}

function tableState(
  bookings: CalendarDayEvent[],
  blocks: CalendarDayEvent[],
  atMs: number | null,
): TableState {
  if (atMs !== null) {
    if (blocks.some((block) => covers(block, atMs))) {
      return "blocked";
    }
    if (bookings.some((booking) => covers(booking, atMs))) {
      return "occupied";
    }
    const upcoming = bookings.some(
      (booking) => new Date(booking.end_at).getTime() > atMs,
    );
    return upcoming ? "reserved" : "free";
  }
  if (bookings.length > 0) {
    return "reserved";
  }
  return blocks.length > 0 ? "blocked" : "free";
}

function byStart(a: CalendarDayEvent, b: CalendarDayEvent) {
  return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
}

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function BookingChip({
  booking,
  timezone,
  selected,
  dimmed,
  onSelect,
}: {
  booking: CalendarDayEvent;
  timezone: string;
  selected: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
}) {
  const id = booking.reservation_id ?? booking.id;
  const pending = booking.status === "PENDING";

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      title={`${booking.customer ?? "Guest"} · ${booking.status}`}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary bg-primary/5"
          : "border-outline-variant bg-surface hover:bg-background",
        dimmed ? "opacity-55" : undefined,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 rounded-full",
          pending ? "bg-warning" : "bg-success",
        )}
      />
      <span className="font-mono text-xs font-semibold tabular-nums text-on-surface">
        {formatBusinessTime(booking.start_at, timezone)}–
        {formatBusinessTime(booking.end_at, timezone)}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-on-surface-variant">
        {booking.customer || booking.title}
        {booking.party_size ? ` · ${booking.party_size}` : ""}
      </span>
    </button>
  );
}

function TableTile({
  table,
  bookings,
  blocks,
  atMs,
  timezone,
  selectedId,
  onSelect,
}: {
  table: DiningTable;
  bookings: CalendarDayEvent[];
  blocks: CalendarDayEvent[];
  atMs: number | null;
  timezone: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const state = tableState(bookings, blocks, atMs);
  const styles = STATE_STYLES[state];

  return (
    <li
      className={cn(
        "flex min-h-28 flex-col gap-2 rounded-2xl border p-3 transition-colors",
        styles.tile,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-on-surface">
            {table.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Icon name="group" size={14} />
            {table.capacity} seats
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            styles.pill,
          )}
        >
          {STATE_LABEL[state]}
        </span>
      </div>

      {blocks.length > 0 || bookings.length > 0 ? (
        <ul className="space-y-1">
          {blocks.map((block) => (
            <li
              key={block.id}
              className="flex items-center gap-2 rounded-lg border border-dashed border-outline-variant bg-surface px-2 py-1.5 text-xs text-on-surface-variant"
            >
              <Icon name="block" size={14} />
              <span className="font-mono font-semibold tabular-nums">
                {formatBusinessTime(block.start_at, timezone)}–
                {formatBusinessTime(block.end_at, timezone)}
              </span>
              <span className="min-w-0 flex-1 truncate">{block.title}</span>
            </li>
          ))}
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BookingChip
                booking={booking}
                timezone={timezone}
                selected={(booking.reservation_id ?? booking.id) === selectedId}
                dimmed={
                  atMs !== null &&
                  !covers(booking, atMs) &&
                  new Date(booking.end_at).getTime() <= atMs
                }
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-auto text-xs text-on-surface-variant">
          No bookings
        </p>
      )}
    </li>
  );
}

export function TableMapping({
  floor,
  floorLoading,
  floorError,
  onRetryFloor,
  day,
  dayLoading,
  dayError,
  onRetryDay,
  date,
  timezone,
  selectedId,
  onSelect,
}: TableMappingProps) {
  const now = useNow();
  const [viewTime, setViewTime] = useState("");

  const isToday = date === businessToday(timezone, new Date(now));
  const timeOptions = useMemo(() => buildTimeOptions(day), [day]);

  // "Now" only means something on today's date; otherwise show the whole day.
  const atMs = viewTime
    ? businessLocalToDate(date, viewTime, timezone).getTime()
    : isToday
      ? now
      : null;

  const { bookingsByTable, blocksByTable, unassigned, tableIds } =
    useMemo(() => {
      const ids = new Set(floor.flatMap((entry) => entry.tables.map((t) => t.id)));
      const bookingsMap = new Map<string, CalendarDayEvent[]>();
      const blocksMap = new Map<string, CalendarDayEvent[]>();
      const loose: CalendarDayEvent[] = [];

      const addBlock = (tableId: string, event: CalendarDayEvent) => {
        const list = blocksMap.get(tableId) ?? [];
        list.push(event);
        blocksMap.set(tableId, list);
      };

      for (const event of day?.events ?? []) {
        // The API sends upper-case types: RESERVATION, TABLE_BLOCK, AREA_BLOCK,
        // BUSINESS_BLOCK.
        const type = event.type.toUpperCase();
        if (type === "RESERVATION") {
          if (!HOLDING_STATUSES.has(event.status.toUpperCase())) {
            continue;
          }
          if (event.table_id && ids.has(event.table_id)) {
            const list = bookingsMap.get(event.table_id) ?? [];
            list.push(event);
            bookingsMap.set(event.table_id, list);
          } else {
            loose.push(event);
          }
          continue;
        }

        if (event.status.toUpperCase() === "CANCELLED") {
          continue;
        }
        if (type === "TABLE_BLOCK") {
          if (event.table_id && ids.has(event.table_id)) {
            addBlock(event.table_id, event);
          }
        } else if (type === "AREA_BLOCK") {
          for (const entry of floor) {
            if (entry.area.id === event.area_id) {
              for (const table of entry.tables) {
                addBlock(table.id, event);
              }
            }
          }
        } else if (type === "BUSINESS_BLOCK") {
          for (const id of ids) {
            addBlock(id, event);
          }
        }
      }

      for (const list of bookingsMap.values()) {
        list.sort(byStart);
      }
      for (const list of blocksMap.values()) {
        list.sort(byStart);
      }
      loose.sort(byStart);

      return {
        bookingsByTable: bookingsMap,
        blocksByTable: blocksMap,
        unassigned: loose,
        tableIds: ids,
      };
    }, [day, floor]);

  if (floorLoading || dayLoading) {
    return (
      <div className="space-y-3 p-4" aria-label="Loading table mapping">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`skeleton-mapping-${index}`}
            className="h-32 animate-pulse rounded-2xl bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  const error = floorError || dayError;
  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-on-surface">{error}</p>
        <button
          type="button"
          onClick={floorError ? onRetryFloor : onRetryDay}
          className="mt-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tableIds.size === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-on-surface">No tables yet</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Add areas and tables on the Area page to see them mapped here.
        </p>
      </div>
    );
  }

  let reservedTables = 0;
  for (const id of tableIds) {
    if ((bookingsByTable.get(id)?.length ?? 0) > 0) {
      reservedTables += 1;
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
          {(["free", "reserved", "occupied", "blocked"] as const).map(
            (state) => (
              <span key={state} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 rounded-full",
                    state === "free" && "bg-success",
                    state === "reserved" && "bg-warning",
                    state === "occupied" && "bg-error",
                    state === "blocked" && "bg-on-surface-variant/50",
                  )}
                />
                {STATE_LABEL[state]}
              </span>
            ),
          )}
        </div>
        <label className="flex items-center gap-2 text-xs text-on-surface-variant">
          View at
          <select
            value={viewTime}
            onChange={(event) => setViewTime(event.target.value)}
            className="min-h-9 rounded-lg border border-outline-variant bg-surface px-2 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="">{isToday ? "Now" : "Whole day"}</option>
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-on-surface-variant">
        {reservedTables} of {tableIds.size} tables have bookings
        {day?.closed ? " · Closed this day" : ""}. Cancelled and completed
        bookings are released automatically.
      </p>

      {floor.map(({ area, tables }) => {
        const areaBooked = tables.filter(
          (table) => (bookingsByTable.get(table.id)?.length ?? 0) > 0,
        ).length;

        return (
          <section
            key={area.id}
            className="rounded-2xl border border-outline-variant bg-surface p-3"
          >
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="truncate text-sm font-semibold text-on-surface">
                {area.name}
              </h3>
              <p className="shrink-0 text-xs text-on-surface-variant">
                {areaBooked}/{tables.length} booked
              </p>
            </div>
            {tables.length === 0 ? (
              <p className="text-xs text-on-surface-variant">
                No active tables in this area.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {tables.map((table) => (
                  <TableTile
                    key={table.id}
                    table={table}
                    bookings={bookingsByTable.get(table.id) ?? []}
                    blocks={blocksByTable.get(table.id) ?? []}
                    atMs={atMs}
                    timezone={timezone}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {unassigned.length > 0 ? (
        <section className="rounded-2xl border border-dashed border-outline-variant bg-surface p-3">
          <h3 className="text-sm font-semibold text-on-surface">
            No table assigned
          </h3>
          <p className="mb-2 text-xs text-on-surface-variant">
            These bookings are not on an active table.
          </p>
          <ul className="space-y-1">
            {unassigned.map((booking) => (
              <li key={booking.id}>
                <BookingChip
                  booking={booking}
                  timezone={timezone}
                  selected={(booking.reservation_id ?? booking.id) === selectedId}
                  dimmed={false}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
