"use client";

import { CustomerMonogram } from "@/components/customers/customer-monogram";
import { CustomerStageBadge } from "@/components/customers/customer-stage-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import {
  customerContactLine,
  customerStage,
  formatRelativeDay,
  statsOf,
  toNumber,
} from "@/lib/customer-crm";
import { formatMenuPrice } from "@/lib/format-price";
import type { Customer } from "@/types/customer";

type CustomerListProps = {
  items: Customer[];
  currency: string;
  selectedId: string | null;
  loading: boolean;
  error: string;
  hasMore: boolean;
  loadingMore: boolean;
  filtered: boolean;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onCreate: () => void;
};

function SkeletonRows() {
  return (
    <div className="space-y-2" aria-label="Loading customers">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={`skeleton-customer-${index}`}
          className="h-[76px] animate-pulse rounded-2xl bg-surface-container-low"
        />
      ))}
    </div>
  );
}

export function CustomerList({
  items,
  currency,
  selectedId,
  loading,
  error,
  hasMore,
  loadingMore,
  filtered,
  onSelect,
  onLoadMore,
  onRetry,
  onCreate,
}: CustomerListProps) {
  if (loading) {
    return <SkeletonRows />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 text-center">
        <p className="text-sm font-medium text-on-surface">{error}</p>
        <div className="mx-auto mt-3 max-w-40">
          <Button variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-10 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-container-low text-secondary">
          <Icon name="group" size={24} />
        </span>
        <p className="mt-3 text-sm font-semibold text-on-surface">
          {filtered ? "No customers match" : "No customers yet"}
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          {filtered
            ? "Try a different search, tag, or segment."
            : "Customers appear automatically from chats and reservations, or add one manually."}
        </p>
        {!filtered ? (
          <div className="mx-auto mt-4 max-w-44">
            <Button onClick={onCreate}>
              <Icon name="person_add" size={18} />
              Add customer
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {items.map((customer) => {
          const stats = statsOf(customer);
          const stage = customerStage(customer);
          const selected = customer.id === selectedId;
          const spent = toNumber(stats.total_spent);

          return (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => onSelect(customer.id)}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant bg-surface hover:bg-background",
                )}
              >
                <CustomerMonogram name={customer.name} vip={stage === "VIP"} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-on-surface">
                      {customer.name}
                    </span>
                    <CustomerStageBadge stage={stage} className="shrink-0" />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                    {customerContactLine(customer)}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-on-surface-variant">
                    <span>
                      <strong className="font-semibold text-on-surface">
                        {stats.completed_count}
                      </strong>{" "}
                      {stats.completed_count === 1 ? "visit" : "visits"}
                    </span>
                    <span>
                      Last{" "}
                      <strong className="font-semibold text-on-surface">
                        {formatRelativeDay(stats.last_visit_at)}
                      </strong>
                    </span>
                    {stats.next_reservation_at ? (
                      <span className="inline-flex items-center gap-1 text-primary-dark">
                        <Icon name="event" size={12} />
                        {formatRelativeDay(stats.next_reservation_at)}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-on-surface">
                    {spent > 0 ? formatMenuPrice(spent, currency) : "—"}
                  </span>
                  <span className="block text-[10px] tracking-wide text-on-surface-variant uppercase">
                    Spent
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {hasMore ? (
        <Button
          variant="ghost"
          loading={loadingMore}
          onClick={onLoadMore}
          className="mt-2"
        >
          Load more
        </Button>
      ) : null}
    </div>
  );
}
