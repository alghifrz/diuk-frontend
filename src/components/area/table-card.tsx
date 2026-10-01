"use client";

import { EntityStatusBadge } from "@/components/area/status-badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { DiningTable } from "@/types/area";

type TableCardProps = {
  table: DiningTable;
  busy: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
};

export function TableCard({
  table,
  busy,
  onEdit,
  onDeactivate,
  onReactivate,
}: TableCardProps) {
  const active = table.status === "ACTIVE";

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-surface p-4 transition-colors",
        active
          ? "border-outline-variant hover:border-primary/40"
          : "border-dashed border-outline-variant bg-surface-container-low/60",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-11 shrink-0 flex-col items-center justify-center rounded-xl",
            active
              ? "bg-primary/10 text-primary-dark"
              : "bg-surface text-on-surface-variant",
          )}
        >
          <Icon name="table_restaurant" size={18} />
          <span className="font-mono text-[10px] font-semibold tabular-nums leading-none">
            {table.capacity}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-on-surface">
              {table.name}
            </h3>
            <EntityStatusBadge status={table.status} />
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            {table.capacity} {table.capacity === 1 ? "seat" : "seats"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 border-t border-outline-variant/80 pt-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-on-surface-variant transition-colors hover:bg-background hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          <Icon name="edit" size={16} />
          Edit
        </button>
        <span aria-hidden className="h-4 w-px bg-outline-variant" />
        {active ? (
          <button
            type="button"
            onClick={onDeactivate}
            disabled={busy}
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-on-surface-variant transition-colors hover:bg-error/5 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Icon name="block" size={16} />
            Deactivate
          </button>
        ) : (
          <button
            type="button"
            onClick={onReactivate}
            disabled={busy}
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-on-surface-variant transition-colors hover:bg-success/10 hover:text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Icon name="check_circle" size={16} />
            Reactivate
          </button>
        )}
      </div>
    </article>
  );
}
