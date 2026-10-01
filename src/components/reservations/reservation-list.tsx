"use client";

import { ReservationItem } from "@/components/reservations/reservation-item";
import { Button } from "@/components/ui/button";
import type { Reservation } from "@/types/reservation";

type ReservationListProps = {
  items: Reservation[];
  timezone: string;
  selectedId: string | null;
  loading: boolean;
  error: string;
  hasMore: boolean;
  loadingMore: boolean;
  emptyLabel?: string;
  emptyHint?: string;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

function SkeletonRows() {
  return (
    <div className="space-y-2" aria-label="Loading reservations">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-reservation-${index}`}
          className="h-[88px] animate-pulse rounded-2xl bg-surface-container-low"
        />
      ))}
    </div>
  );
}

export function ReservationList({
  items,
  timezone,
  selectedId,
  loading,
  error,
  hasMore,
  loadingMore,
  emptyLabel = "No reservations",
  emptyHint = "Reservations created for this business will appear here.",
  onSelect,
  onLoadMore,
  onRetry,
}: ReservationListProps) {
  if (loading) {
    return <SkeletonRows />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 text-center">
        <p className="text-sm font-medium text-on-surface">{error}</p>
        <div className="mx-auto mt-3 max-w-[160px]">
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
        <p className="text-sm font-semibold text-on-surface">{emptyLabel}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {items.map((reservation) => (
          <li key={reservation.id}>
            <ReservationItem
              reservation={reservation}
              timezone={timezone}
              selected={reservation.id === selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
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
