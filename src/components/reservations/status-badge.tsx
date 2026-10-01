import { cn } from "@/lib/cn";
import type { PaymentStatus, ReservationStatus } from "@/types/reservation";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: "bg-warning/15 text-warning ring-warning/30",
  CONFIRMED: "bg-success/15 text-success ring-success/30",
  CANCELLED: "bg-error/10 text-error ring-error/25",
  COMPLETED: "bg-info/15 text-info ring-info/30",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  UNPAID: "bg-warning/15 text-warning ring-warning/30",
  DEPOSIT: "bg-info/15 text-info ring-info/30",
  PAID: "bg-success/15 text-success ring-success/30",
  REFUNDED: "bg-on-surface-variant/10 text-on-surface-variant ring-outline-variant",
};

export function ReservationStatusBadge({
  status,
  className,
}: {
  status: ReservationStatus | string;
  className?: string;
}) {
  const key = status as ReservationStatus;
  const styles = STATUS_STYLES[key] ?? "bg-surface-container-low text-on-surface-variant ring-outline-variant";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        styles,
        className,
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus | string;
  className?: string;
}) {
  const key = status as PaymentStatus;
  const styles =
    PAYMENT_STYLES[key] ??
    "bg-surface-container-low text-on-surface-variant ring-outline-variant";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        styles,
        className,
      )}
    >
      {status}
    </span>
  );
}
