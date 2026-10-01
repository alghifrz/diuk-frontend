"use client";

import { EntityStatusBadge } from "@/components/area/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { Area } from "@/types/area";

type AreaListProps = {
  items: Area[];
  selectedId: string | null;
  loading: boolean;
  error: string;
  onSelect: (id: string) => void;
  onRetry: () => void;
};

function SkeletonRows() {
  return (
    <div className="space-y-1 p-2" aria-label="Loading areas">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[4.5rem] animate-pulse rounded-xl bg-surface-container-low"
        />
      ))}
    </div>
  );
}

function areaInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function AreaList({
  items,
  selectedId,
  loading,
  error,
  onSelect,
  onRetry,
}: AreaListProps) {
  if (loading) {
    return <SkeletonRows />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
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

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-0.5 p-2">
      {items.map((area) => {
        const selected = area.id === selectedId;
        const inactive = area.status !== "ACTIVE";

        return (
          <li key={area.id}>
            <button
              type="button"
              onClick={() => onSelect(area.id)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "group relative flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                selected
                  ? "bg-primary/8"
                  : "hover:bg-background",
                inactive && !selected ? "opacity-70" : undefined,
              )}
            >
              {selected ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
                />
              ) : null}

              <span
                aria-hidden
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                  selected
                    ? "bg-primary text-white"
                    : "bg-surface-container-low text-on-surface-variant group-hover:bg-surface group-hover:text-on-surface",
                )}
              >
                {areaInitial(area.name)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-on-surface">
                    {area.name}
                  </span>
                  {inactive ? <EntityStatusBadge status={area.status} /> : null}
                </span>
                {area.description ? (
                  <span className="mt-0.5 line-clamp-1 block text-xs text-on-surface-variant">
                    {area.description}
                  </span>
                ) : null}
                <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                  <Icon name="table_restaurant" size={14} />
                  <span>
                    {area.active_table_count}
                    {area.table_count !== area.active_table_count
                      ? ` / ${area.table_count}`
                      : ""}{" "}
                    tables
                  </span>
                </span>
              </span>

              <Icon
                name="chevron_right"
                size={18}
                className={cn(
                  "mt-2.5 shrink-0 text-on-surface-variant transition-opacity",
                  selected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-60 lg:opacity-0",
                )}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
