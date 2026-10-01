"use client";

import { useState } from "react";
import {
  PaymentStatusBadge,
  ReservationStatusBadge,
} from "@/components/reservations/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  formatBusinessDate,
  formatBusinessDateLabel,
  formatBusinessTime,
} from "@/lib/business-time";
import { cn } from "@/lib/cn";
import { formatMenuPrice } from "@/lib/format-price";
import type { Reservation, ReservationPayment } from "@/types/reservation";

type ReservationDetailProps = {
  reservation: Reservation | null;
  payment: ReservationPayment | null;
  paymentMissing: boolean;
  depositEnabled: boolean;
  timezone: string;
  loading: boolean;
  error: string;
  actionError: string;
  busyAction: string | null;
  onBack?: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onReschedule: () => void;
  onMarkPaid: () => void;
  onPayFull: () => void;
  onRefundPayment: () => void;
  onCreatePayment: () => void;
  onRetry: () => void;
};

function paymentAmountNumber(amount: string | number) {
  const numeric =
    typeof amount === "number" ? amount : Number(String(amount).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function splitNotes(notes: string | null) {
  const raw = notes?.trim() ?? "";
  if (!raw) {
    return { preference: "", guestNotes: "" };
  }

  const areaMatch = raw.match(/^area preference:\s*(.+)$/i);
  if (areaMatch) {
    return { preference: areaMatch[1].trim(), guestNotes: "" };
  }

  // Common AI / guest preference phrasing stored in notes.
  if (/^(indoor|outdoor|smoking|non[- ]?smoking)\b/i.test(raw) || /meja\s*\d+/i.test(raw)) {
    return { preference: raw, guestNotes: "" };
  }

  return { preference: "", guestNotes: raw };
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-5" aria-label="Loading reservation">
      <div className="h-6 w-40 animate-pulse rounded bg-surface-container-low" />
      <div className="h-4 w-56 animate-pulse rounded bg-surface-container-low" />
      <div className="h-24 animate-pulse rounded-2xl bg-surface-container-low" />
      <div className="h-24 animate-pulse rounded-2xl bg-surface-container-low" />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-on-surface-variant uppercase">
      {children}
    </h3>
  );
}

export function ReservationDetail({
  reservation,
  payment,
  paymentMissing,
  depositEnabled,
  timezone,
  loading,
  error,
  actionError,
  busyAction,
  onBack,
  onConfirm,
  onCancel,
  onComplete,
  onReschedule,
  onMarkPaid,
  onRefundPayment,
  onPayFull,
  onCreatePayment,
  onRetry,
}: ReservationDetailProps) {
  const [confirmPayFull, setConfirmPayFull] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmConfirm, setConfirmConfirm] = useState(false);
  const [confirmMarkPaid, setConfirmMarkPaid] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [confirmCreatePayment, setConfirmCreatePayment] = useState(false);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <p className="text-sm font-medium text-on-surface">{error}</p>
        <div className="w-full max-w-40">
          <Button variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-low text-secondary">
          <Icon name="event_note" size={28} />
        </span>
        <p className="mt-4 text-sm font-semibold text-on-surface">
          Select a reservation
        </p>
        <p className="mt-1 max-w-xs text-sm text-on-surface-variant">
          Choose a booking from the list to view details, payment, and actions.
        </p>
      </div>
    );
  }

  const dateYmd = formatBusinessDate(reservation.start_at, timezone);
  const { preference, guestNotes } = splitNotes(reservation.notes);
  const canConfirm = reservation.status === "PENDING";
  const canCancel =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const canComplete = reservation.status === "CONFIRMED";
  const canReschedule =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const footerBusy =
    confirmConfirm || confirmCancel || confirmComplete;
  const amountValue = payment ? paymentAmountNumber(payment.amount) : 0;
  const amountLabel = payment
    ? formatMenuPrice(payment.amount, payment.currency)
    : null;
  const zeroDeposit = Boolean(payment && amountValue <= 0);
  const orderTotal = (reservation.items ?? []).reduce((sum, item) => {
    return sum + paymentAmountNumber(item.unit_price) * item.quantity;
  }, 0);
  const currency = payment?.currency || "IDR";
  const paymentType = (payment?.payment_type || "NONE").toUpperCase();
  const markPaidLabel =
    paymentType === "DEPOSIT" ? "Mark deposit paid" : "Mark fully paid";
  const markPaidHint =
    paymentType === "DEPOSIT"
      ? `Confirm deposit of ${amountLabel} has been collected.`
      : `Confirm full payment of ${amountLabel} has been collected.`;

  // Mirrors the backend gate (AssertConfirmable): with deposits on, a booking
  // cannot be confirmed until the guest's payment has actually been received.
  const paymentReceived =
    payment?.status === "PAID" || payment?.status === "DEPOSIT";
  const confirmBlocked = canConfirm && depositEnabled && !paymentReceived;
  // Completing needs the balance settled too (backend: AssertCompletable).
  const paidInFull = payment?.status === "PAID";
  const completeBlocked = canComplete && depositEnabled && !paidInFull;
  const canPayFull =
    payment?.status === "DEPOSIT" &&
    (reservation.status === "PENDING" || reservation.status === "CONFIRMED");
  const balanceDue = Math.max(0, orderTotal - amountValue);
  const completeBlockedHint = !payment
    ? "Add a payment record and settle it before completing."
    : payment.status === "DEPOSIT"
      ? `Waiting for the remaining ${formatMenuPrice(balanceDue, currency)}. Use "Pay in full" once the guest has paid it.`
      : payment.status === "REFUNDED"
        ? "This payment was refunded. Collect payment again before completing."
        : "Waiting for the guest's payment. Mark it paid before completing.";
  const confirmBlockedHint = !payment
    ? "Add a payment record and mark it paid before confirming."
    : payment.status === "REFUNDED"
      ? "This payment was refunded. Collect payment again before confirming."
      : payment.payment_type?.toUpperCase() === "FULL"
        ? "Waiting for the guest's full payment. Mark it paid to enable confirmation."
        : "Waiting for the guest's deposit. Mark it paid to enable confirmation.";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-outline-variant px-4 py-4 sm:px-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          >
            <Icon name="arrow_back" size={18} />
            Back
          </button>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight text-on-surface">
                {reservation.customer.name}
              </h2>
              <ReservationStatusBadge status={reservation.status} />
            </div>
            {reservation.customer.phone ? (
              <a
                href={`tel:${reservation.customer.phone}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition hover:text-secondary"
              >
                <Icon name="call" size={16} />
                {reservation.customer.phone}
              </a>
            ) : (
              <p className="mt-1 text-sm text-on-surface-variant">No phone on file</p>
            )}
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        {actionError ? (
          <p
            role="alert"
            className="rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {actionError}
          </p>
        ) : null}

        <section className="rounded-2xl border border-outline-variant bg-background/80 p-4">
          <SectionLabel>Reservation</SectionLabel>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-on-surface-variant">Date</dt>
              <dd className="mt-0.5 font-medium text-on-surface">
                {formatBusinessDateLabel(dateYmd, timezone)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-on-surface-variant">Party</dt>
              <dd className="mt-0.5 font-medium text-on-surface">
                {reservation.party_size} guests
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-on-surface-variant">Time</dt>
              <dd className="mt-0.5 font-mono text-base font-semibold tracking-tight text-on-surface">
                {formatBusinessTime(reservation.start_at, timezone)}
                <span className="mx-1.5 font-sans font-normal text-on-surface-variant">
                  –
                </span>
                {formatBusinessTime(reservation.end_at, timezone)}
              </dd>
            </div>
          </dl>

          {guestNotes ? (
            <div className="mt-3 rounded-xl border border-outline-variant/80 bg-surface px-3 py-2.5">
              <p className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
                Guest notes
              </p>
              <p className="mt-1 text-sm text-on-surface">{guestNotes}</p>
            </div>
          ) : null}

          {reservation.cancellation_reason ? (
            <p className="mt-3 text-sm text-error">
              Cancelled: {reservation.cancellation_reason}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-outline-variant bg-background/80 p-4">
          <SectionLabel>Table</SectionLabel>
          {reservation.table ? (
            <div className="mt-3 flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
                <Icon name="table_restaurant" size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface">
                  {reservation.table.table_name}
                </p>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  {reservation.table.area_name} · seats {reservation.table.capacity}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                <Icon name="event_seat" size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface">
                  No table assigned yet
                </p>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  Assigned automatically when you confirm, or pick one when
                  rescheduling.
                </p>
                {preference ? (
                  <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface">
                    <Icon name="place" size={14} />
                    <span className="truncate">Requested: {preference}</span>
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-outline-variant bg-background/80 p-4">
          <SectionLabel>Pre-order</SectionLabel>
          {(reservation.items ?? []).length > 0 ? (
            <>
              <ul className="mt-3 space-y-2">
                {(reservation.items ?? []).map((item) => {
                  const line =
                    paymentAmountNumber(item.unit_price) * item.quantity;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-xl bg-surface-container-low/70 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface">
                          {item.quantity}× {item.menu_item_name}
                        </p>
                        {item.notes ? (
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-on-surface">
                        {formatMenuPrice(line, currency)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-outline-variant pt-3 text-sm">
                <span className="text-on-surface-variant">Order total</span>
                <span className="font-semibold tabular-nums text-on-surface">
                  {formatMenuPrice(orderTotal, currency)}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-on-surface-variant">No pre-order</p>
          )}
        </section>

        <section className="rounded-2xl border border-outline-variant bg-background/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <SectionLabel>Payment</SectionLabel>
            {depositEnabled ? (
              <span className="rounded-md bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-secondary uppercase">
                Deposit on
              </span>
            ) : (
              <span className="rounded-md bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                Deposit off
              </span>
            )}
          </div>

          {payment ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <PaymentStatusBadge status={payment.status} />
                    {paymentType !== "NONE" ? (
                      <span className="rounded-md bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
                        {paymentType === "FULL" ? "Full payment" : "Deposit"}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {payment.status === "UNPAID"
                      ? zeroDeposit
                        ? "Amount is zero — check deposit settings and menu items."
                        : paymentType === "DEPOSIT"
                          ? "Waiting for deposit payment."
                          : paymentType === "FULL"
                            ? "Waiting for full pre-order payment."
                            : "Waiting for guest payment."
                      : payment.status === "DEPOSIT"
                        ? payment.confirmed_at
                          ? `Deposit received ${formatBusinessDateLabel(formatBusinessDate(payment.confirmed_at, timezone), timezone)}`
                          : "Deposit received."
                        : payment.status === "PAID"
                          ? payment.confirmed_at
                            ? `Paid in full ${formatBusinessDateLabel(formatBusinessDate(payment.confirmed_at, timezone), timezone)}`
                            : "Paid in full."
                          : payment.refunded_at
                            ? `Refunded ${formatBusinessDateLabel(formatBusinessDate(payment.refunded_at, timezone), timezone)}`
                            : "Payment refunded."}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-mono text-xl font-semibold tracking-tight",
                      zeroDeposit ? "text-on-surface-variant" : "text-on-surface",
                    )}
                  >
                    {amountLabel}
                  </p>
                  {orderTotal > 0 && paymentType === "DEPOSIT" ? (
                    <p className="mt-0.5 text-[11px] text-on-surface-variant">
                      of {formatMenuPrice(orderTotal, currency)} order
                    </p>
                  ) : null}
                </div>
              </div>

              {zeroDeposit && payment.status === "UNPAID" ? (
                <p className="rounded-xl border border-warning/25 bg-warning/10 px-3 py-2 text-xs leading-5 text-on-surface">
                  Set deposit as <span className="font-medium">Percentage</span>{" "}
                  of the menu total in{" "}
                  <span className="font-medium">Settings → Reservations</span>,
                  and ensure the booking has menu items.
                </p>
              ) : null}

              {payment.notes ? (
                <p className="rounded-xl bg-surface px-3 py-2 text-xs text-on-surface">
                  {payment.notes}
                </p>
              ) : null}

              {confirmMarkPaid ? (
                <ConfirmStrip
                  title={markPaidLabel + "?"}
                  body={markPaidHint}
                  confirmLabel={markPaidLabel}
                  loading={busyAction === "pay-confirm"}
                  disabled={busyAction !== null}
                  onCancel={() => setConfirmMarkPaid(false)}
                  onConfirm={() => {
                    onMarkPaid();
                    setConfirmMarkPaid(false);
                  }}
                />
              ) : null}

              {confirmPayFull ? (
                <ConfirmStrip
                  title="Record full payment?"
                  body={`Confirm the remaining ${formatMenuPrice(balanceDue, currency)} has been collected. The payment becomes ${formatMenuPrice(orderTotal, currency)} (paid in full) and counts toward revenue once the booking is completed.`}
                  confirmLabel="Pay in full"
                  loading={busyAction === "pay-full"}
                  disabled={busyAction !== null}
                  onCancel={() => setConfirmPayFull(false)}
                  onConfirm={() => {
                    onPayFull();
                    setConfirmPayFull(false);
                  }}
                />
              ) : null}

              {confirmRefund ? (
                <ConfirmStrip
                  title="Refund this payment?"
                  body="Status will change to Refunded."
                  confirmLabel="Refund"
                  confirmVariant="destructive"
                  loading={busyAction === "pay-refund"}
                  disabled={busyAction !== null}
                  onCancel={() => setConfirmRefund(false)}
                  onConfirm={() => {
                    onRefundPayment();
                    setConfirmRefund(false);
                  }}
                />
              ) : null}

              {!confirmMarkPaid && !confirmRefund && !confirmPayFull ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {payment.status === "UNPAID" ? (
                    <Button
                      variant="secondary"
                      className="w-auto min-w-0"
                      onClick={() => setConfirmMarkPaid(true)}
                      disabled={busyAction !== null}
                    >
                      <Icon name="payments" size={18} />
                      {markPaidLabel}
                    </Button>
                  ) : null}
                  {canPayFull ? (
                    <Button
                      variant="secondary"
                      className="w-auto min-w-0"
                      onClick={() => setConfirmPayFull(true)}
                      disabled={busyAction !== null || balanceDue <= 0}
                    >
                      <Icon name="payments" size={18} />
                      Pay in full
                    </Button>
                  ) : null}
                  {payment.status === "PAID" || payment.status === "DEPOSIT" ? (
                    <Button
                      variant="ghost"
                      className="w-auto min-w-0"
                      onClick={() => setConfirmRefund(true)}
                      disabled={busyAction !== null}
                    >
                      <Icon name="undo" size={18} />
                      Refund
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : paymentMissing ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-outline-variant bg-surface/60 px-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant">
                  <Icon name="receipt_long" size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    No payment record yet
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">
                    {depositEnabled
                      ? "Create one to track the deposit for this booking."
                      : "Optional — create a record if you want to track payment manually."}
                  </p>
                </div>
              </div>

              {confirmCreatePayment ? (
                <ConfirmStrip
                  title="Create payment record?"
                  body={
                    depositEnabled
                      ? "Creates an unpaid deposit using your reservation deposit settings."
                      : "Creates an unpaid payment record from current business settings."
                  }
                  confirmLabel="Create"
                  loading={busyAction === "pay-create"}
                  disabled={busyAction !== null}
                  onCancel={() => setConfirmCreatePayment(false)}
                  onConfirm={() => {
                    onCreatePayment();
                    setConfirmCreatePayment(false);
                  }}
                />
              ) : (
                <Button
                  variant="ghost"
                  className="w-auto"
                  onClick={() => setConfirmCreatePayment(true)}
                  disabled={busyAction !== null}
                >
                  <Icon name="add" size={18} />
                  Add payment record
                </Button>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-on-surface-variant">
              Payment unavailable.
            </p>
          )}
        </section>
      </div>

      <footer className="space-y-2 border-t border-outline-variant bg-surface px-4 py-3 sm:px-5">
        {confirmConfirm ? (
          <ConfirmStrip
            title="Confirm this reservation?"
            body="A table will be assigned if one is available."
            confirmLabel="Confirm booking"
            loading={busyAction === "confirm"}
            disabled={busyAction !== null}
            onCancel={() => setConfirmConfirm(false)}
            onConfirm={() => {
              onConfirm();
              setConfirmConfirm(false);
            }}
          />
        ) : null}

        {confirmCancel ? (
          <ConfirmStrip
            title="Cancel this reservation?"
            body="The booking will be marked as cancelled."
            confirmLabel="Cancel booking"
            confirmVariant="destructive"
            loading={busyAction === "cancel"}
            disabled={busyAction !== null}
            onCancel={() => setConfirmCancel(false)}
            onConfirm={() => {
              onCancel();
              setConfirmCancel(false);
            }}
          />
        ) : null}

        {confirmComplete ? (
          <ConfirmStrip
            title="Mark as completed?"
            body="Use this when the guest has finished and the table is free."
            confirmLabel="Complete"
            loading={busyAction === "complete"}
            disabled={busyAction !== null}
            onCancel={() => setConfirmComplete(false)}
            onConfirm={() => {
              onComplete();
              setConfirmComplete(false);
            }}
          />
        ) : null}

        {!footerBusy ? (
          <div className="flex flex-col gap-2">
            {canConfirm || canComplete ? (
              <>
                <Button
                  onClick={() =>
                    canConfirm
                      ? setConfirmConfirm(true)
                      : setConfirmComplete(true)
                  }
                  disabled={
                    busyAction !== null || confirmBlocked || completeBlocked
                  }
                  loading={busyAction === "confirm" || busyAction === "complete"}
                >
                  {canConfirm ? "Confirm booking" : "Complete booking"}
                </Button>
                {confirmBlocked || completeBlocked ? (
                  <p className="text-center text-xs text-on-surface-variant">
                    {confirmBlocked ? confirmBlockedHint : completeBlockedHint}
                  </p>
                ) : null}
              </>
            ) : null}
            <div
              className={cn(
                "grid gap-2",
                canReschedule && canCancel ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {canReschedule ? (
                <Button
                  variant="ghost"
                  onClick={onReschedule}
                  disabled={busyAction !== null}
                >
                  Reschedule
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmCancel(true)}
                  disabled={busyAction !== null}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </footer>
    </div>
  );
}

function ConfirmStrip({
  title,
  body,
  confirmLabel,
  confirmVariant = "primary",
  loading,
  disabled,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "destructive";
  loading: boolean;
  disabled: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-outline-variant bg-background p-3">
      <p className="text-sm font-medium text-on-surface">{title}</p>
      <p className="text-xs leading-5 text-on-surface-variant">{body}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={disabled}>
          Back
        </Button>
        <Button
          variant={confirmVariant}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
