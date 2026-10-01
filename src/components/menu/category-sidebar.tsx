"use client";

import { EntityStatusBadge } from "@/components/area/status-badge";
import { cn } from "@/lib/cn";
import type { MenuCategory } from "@/types/menu";

type CategorySidebarProps = {
  categories: MenuCategory[];
  selectedId: string | null;
  loading: boolean;
  error: string;
  onSelect: (id: string | null) => void;
  onRetry: () => void;
  onManage: () => void;
};

export function CategorySidebar({
  categories,
  selectedId,
  loading,
  error,
  onSelect,
  onRetry,
  onManage,
}: CategorySidebarProps) {
  const active = categories.filter((item) => item.status === "ACTIVE");
  const inactive = categories.filter((item) => item.status === "INACTIVE");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-4 py-2.5">
        <h3 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
          Categories
        </h3>
        <button
          type="button"
          onClick={onManage}
          className="text-xs font-medium text-primary-dark transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Manage
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1" aria-label="Loading categories">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-surface-container-low"
              />
            ))}
          </div>
        ) : error ? (
          <div className="px-2 py-6 text-center">
            <p className="text-sm text-error">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Retry
            </button>
          </div>
        ) : (
          <nav aria-label="Menu categories" className="space-y-1">
            <CategoryButton
              label="All Items"
              selected={selectedId === null}
              onClick={() => onSelect(null)}
            />
            {active.map((category) => (
              <CategoryButton
                key={category.id}
                label={category.name}
                count={category.active_item_count}
                selected={selectedId === category.id}
                onClick={() => onSelect(category.id)}
              />
            ))}
            {inactive.length > 0 ? (
              <div className="pt-3">
                <p className="px-2 pb-1 text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                  Inactive
                </p>
                {inactive.map((category) => (
                  <CategoryButton
                    key={category.id}
                    label={category.name}
                    count={category.item_count}
                    selected={selectedId === category.id}
                    inactive
                    onClick={() => onSelect(category.id)}
                  />
                ))}
              </div>
            ) : null}
          </nav>
        )}
      </div>
    </div>
  );
}

type CategoryChipsProps = {
  categories: MenuCategory[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string | null) => void;
};

export function CategoryChips({
  categories,
  selectedId,
  loading,
  onSelect,
}: CategoryChipsProps) {
  const active = categories.filter((item) => item.status === "ACTIVE");

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Loading categories">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
      <Chip
        label="All"
        selected={selectedId === null}
        onClick={() => onSelect(null)}
      />
      {active.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          selected={selectedId === category.id}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </div>
  );
}

function CategoryButton({
  label,
  count,
  selected,
  inactive,
  onClick,
}: {
  label: string;
  count?: number;
  selected: boolean;
  inactive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "bg-primary/10 text-on-surface"
          : "text-on-surface-variant hover:bg-background hover:text-on-surface",
        inactive ? "opacity-70" : undefined,
      )}
    >
      <span className="truncate text-sm font-medium">{label}</span>
      {typeof count === "number" ? (
        <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary bg-primary/10 text-on-surface"
          : "border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface",
      )}
    >
      {label}
    </button>
  );
}

export function CategoryStatusHint({ status }: { status: string }) {
  return <EntityStatusBadge status={status} />;
}
