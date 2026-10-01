"use client";

import { MenuItemCard } from "@/components/menu/menu-item-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { MenuItem } from "@/types/menu";

type MenuGridProps = {
  items: MenuItem[];
  currency: string;
  loading: boolean;
  error: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry: () => void;
  onOpen: (item: MenuItem) => void;
};

export function MenuGrid({
  items,
  currency,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  onOpen,
}: MenuGridProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        aria-label="Loading menu items"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[400px] overflow-hidden rounded-xl border border-outline-variant bg-surface"
          >
            <div className="h-64 animate-pulse bg-surface-container-low" />
            <div className="space-y-1.5 p-2.5">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-container-low" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-container-low" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-surface-container-low" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-error/10 text-error">
          <Icon name="error" size={24} />
        </span>
        <p className="mt-4 text-sm font-medium text-on-surface">{error}</p>
        <div className="mt-4 w-full max-w-[140px]">
          <Button variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
          <Icon name="restaurant_menu" size={24} />
        </span>
        <p className="mt-4 text-sm font-semibold text-on-surface">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-on-surface-variant">
          {emptyDescription}
        </p>
        {emptyActionLabel && onEmptyAction ? (
          <div className="mt-5 w-full max-w-[180px]">
            <Button onClick={onEmptyAction}>
              <Icon name="add" size={18} />
              {emptyActionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item, index) => (
        <MenuItemCard
          key={item.id}
          item={item}
          currency={currency}
          priority={index < 8}
          onOpen={() => onOpen(item)}
        />
      ))}
    </div>
  );
}
