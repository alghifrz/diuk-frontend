"use client";

import { cn } from "@/lib/cn";
import type { AvailableTable, Availability } from "@/types/reservation";

type AvailabilityPickerProps = {
  data: Availability | null;
  loading: boolean;
  error: string;
  selectedTableId: string | null;
  allowNoTable?: boolean;
  onSelect: (tableId: string | null) => void;
};

function groupByArea(tables: AvailableTable[]) {
  const map = new Map<string, { areaName: string; tables: AvailableTable[] }>();
  for (const table of tables) {
    const existing = map.get(table.area_id);
    if (existing) {
      existing.tables.push(table);
    } else {
      map.set(table.area_id, { areaName: table.area_name, tables: [table] });
    }
  }
  return Array.from(map.entries());
}

export function AvailabilityPicker({
  data,
  loading,
  error,
  selectedTableId,
  allowNoTable = true,
  onSelect,
}: AvailabilityPickerProps) {
  if (loading) {
    return (
      <div
        className="space-y-2 rounded-2xl border border-outline-variant bg-background p-3"
        aria-label="Checking availability"
      >
        <div className="h-4 w-32 animate-pulse rounded bg-surface-container-low" />
        <div className="h-14 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="h-14 animate-pulse rounded-xl bg-surface-container-low" />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-on-surface-variant">
        Choose date, time, and party size to check availability.
      </p>
    );
  }

  const groups = groupByArea(data.tables);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-on-surface">Available tables</h3>
        <span className="text-xs text-on-surface-variant">
          {data.available ? `${data.tables.length} available` : "None available"}
        </span>
      </div>

      {allowNoTable ? (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selectedTableId === null
              ? "border-primary bg-primary/5 font-medium text-on-surface"
              : "border-outline-variant bg-surface text-on-surface-variant hover:bg-background",
          )}
        >
          No table assigned
        </button>
      ) : null}

      {!data.available || groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant px-3 py-4 text-sm text-on-surface-variant">
          No tables available for this slot.
        </p>
      ) : (
        groups.map(([areaId, group]) => (
          <div key={areaId} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              {group.areaName}
            </p>
            <ul className="space-y-1.5">
              {group.tables.map((table) => {
                const selected = selectedTableId === table.table_id;
                return (
                  <li key={table.table_id}>
                    <button
                      type="button"
                      onClick={() => onSelect(table.table_id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant bg-surface hover:bg-background",
                      )}
                    >
                      <span className="text-sm font-medium text-on-surface">
                        {table.table_name}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Capacity {table.capacity}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
