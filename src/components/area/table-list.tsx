"use client";

import { TableCard } from "@/components/area/table-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { DiningTable } from "@/types/area";

type TableListProps = {
  tables: DiningTable[];
  loading: boolean;
  error: string;
  busyId: string | null;
  onRetry: () => void;
  onEdit: (table: DiningTable) => void;
  onDeactivate: (table: DiningTable) => void;
  onReactivate: (table: DiningTable) => void;
  onAdd: () => void;
  canAdd: boolean;
};

function SkeletonGrid() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading tables"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[8.25rem] animate-pulse rounded-2xl bg-surface-container-low"
        />
      ))}
    </div>
  );
}

export function TableList({
  tables,
  loading,
  error,
  busyId,
  onRetry,
  onEdit,
  onDeactivate,
  onReactivate,
  onAdd,
  canAdd,
}: TableListProps) {
  if (loading) {
    return <SkeletonGrid />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-outline-variant bg-surface px-4 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-error/10 text-error">
          <Icon name="error" size={20} />
        </span>
        <p className="mt-3 text-sm font-medium text-on-surface">{error}</p>
        <div className="mt-3 w-full max-w-[140px]">
          <Button variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
          <Icon name="table_restaurant" size={24} />
        </span>
        <p className="mt-4 text-sm font-semibold text-on-surface">
          No tables in this area
        </p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-on-surface-variant">
          Add a table so this area can be offered when checking reservation
          availability.
        </p>
        {canAdd ? (
          <div className="mt-5 w-full max-w-[180px]">
            <Button onClick={onAdd}>
              <Icon name="add" size={18} />
              Add Table
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-xs text-on-surface-variant">
            Reactivate this area before adding tables.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          busy={busyId === table.id}
          onEdit={() => onEdit(table)}
          onDeactivate={() => onDeactivate(table)}
          onReactivate={() => onReactivate(table)}
        />
      ))}
    </div>
  );
}
