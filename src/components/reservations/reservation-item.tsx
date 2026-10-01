"use client";

import { ReservationStatusBadge, PaymentStatusBadge } from "@/components/reservations/status-badge";
import { cn } from "@/lib/cn";
import { formatBusinessTime } from "@/lib/business-time";
import type { Reservation } from "@/types/reservation";

type ReservationItemProps = {
  reservation: Reservation;
  timezone: string;
  selected: boolean;
  paymentHint?: string | null;
  onSelect: (id: string) => void;
};

export function ReservationItem({
  reservation,
  timezone,
  selected,
  paymentHint,
  onSelect,
}: ReservationItemProps) {
  const time = formatBusinessTime(reservation.start_at, timezone);
  const tableLabel = reservation.table
    ? `${reservation.table.area_name} · ${reservation.table.table_name}`
    : reservation.notes?.trim()
      ? `Requested: ${reservation.notes.trim()}`
      : "No table assigned";

  return (
    <button
      type="button"
      onClick={() => onSelect(reservation.id)}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "w-full rounded-2xl border px-3.5 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "border-primary bg-primary/5"
          : "border-outline-variant bg-surface hover:bg-background",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <time
          dateTime={reservation.start_at}
          className="font-mono text-base font-semibold tabular-nums text-on-surface"
        >
          {time}
        </time>
        <ReservationStatusBadge status={reservation.status} />
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-on-surface">
        {reservation.customer.name}
      </p>
      <p className="mt-0.5 truncate text-xs text-on-surface-variant">
        {reservation.party_size} guests · {tableLabel}
      </p>
      {paymentHint ? (
        <p className="mt-1.5 text-[11px] font-medium text-on-surface-variant">
          {paymentHint === "PAID" ||
          paymentHint === "UNPAID" ||
          paymentHint === "REFUNDED" ? (
            <PaymentStatusBadge status={paymentHint} />
          ) : (
            paymentHint
          )}
        </p>
      ) : null}
    </button>
  );
}
