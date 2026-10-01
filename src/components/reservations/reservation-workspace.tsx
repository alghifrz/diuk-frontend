"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReservationDetail } from "@/components/reservations/reservation-detail";
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { ReservationList } from "@/components/reservations/reservation-list";
import { RescheduleDialog } from "@/components/reservations/reschedule-dialog";
import { TableMapping } from "@/components/reservations/table-mapping";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useBusinessContext } from "@/hooks/use-business-context";
import { useFloorPlan } from "@/hooks/use-floor-plan";
import { useReservation } from "@/hooks/use-reservation";
import { useReservations } from "@/hooks/use-reservations";
import { getCalendarDay } from "@/lib/api/calendar";
import {
  cancelReservation,
  completeReservation,
  confirmReservation,
} from "@/lib/api/reservations";
import {
  confirmReservationPayment,
  markReservationPaymentFull,
  createReservationPayment,
  refundReservationPayment,
} from "@/lib/api/payments";
import { businessToday, formatBusinessDate } from "@/lib/business-time";
import { cn } from "@/lib/cn";
import { reservationErrorMessage } from "@/lib/reservation-errors";
import type {
  CalendarDayView,
  Reservation,
  ReservationStatus,
} from "@/types/reservation";

type ViewMode = "list" | "mapping";

function readDateParam(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function ReservationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("reservation");
  const urlDate = readDateParam(searchParams.get("date"));

  const business = useBusinessContext();
  const [status, setStatus] = useState<ReservationStatus | "">("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleKey, setRescheduleKey] = useState(0);
  const [actionError, setActionError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [day, setDay] = useState<CalendarDayView | null>(null);
  const [dayLoadedFor, setDayLoadedFor] = useState("");
  const [dayError, setDayError] = useState("");

  const date =
    urlDate ??
    (business.loading ? "" : businessToday(business.timezone));

  const list = useReservations({
    date,
    status,
    enabled: Boolean(date) && !business.loading,
  });

  const detail = useReservation(selectedId);
  const floorPlan = useFloorPlan();

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return list.items;
    }
    return list.items.filter((item) => {
      const haystack = [item.customer.name, item.customer.phone ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [list.items, search]);

  useEffect(() => {
    if (view !== "mapping" || !date) {
      return;
    }

    let cancelled = false;

    getCalendarDay({ date })
      .then((next) => {
        if (cancelled) {
          return;
        }
        setDay(next);
        setDayError("");
        setDayLoadedFor(date);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setDay(null);
        setDayError(
          reservationErrorMessage(err, "Couldn't load day schedule."),
        );
        setDayLoadedFor(date);
      });

    return () => {
      cancelled = true;
    };
  }, [date, view]);

  // Keep the mapping fresh: AI/WhatsApp bookings and status changes land here.
  useEffect(() => {
    if (view !== "mapping" || !date) {
      return;
    }
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        getCalendarDay({ date })
          .then((next) => setDay(next))
          .catch(() => undefined);
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, [date, view]);

  const reloadDay = useCallback(() => {
    if (!date) {
      return;
    }

    getCalendarDay({ date })
      .then((next) => {
        setDay(next);
        setDayError("");
        setDayLoadedFor(date);
      })
      .catch((err: unknown) => {
        setDay(null);
        setDayError(
          reservationErrorMessage(err, "Couldn't load day schedule."),
        );
        setDayLoadedFor(date);
      });
  }, [date]);

  const selectReservation = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("reservation", id);
      if (date) {
        params.set("date", date);
      }
      router.replace(`/reservations?${params.toString()}`, { scroll: false });
      setActionError("");
    },
    [date, router, searchParams],
  );

  const clearSelection = useCallback(() => {
    const params = new URLSearchParams();
    if (date) {
      params.set("date", date);
    }
    const query = params.toString();
    router.replace(query ? `/reservations?${query}` : "/reservations", {
      scroll: false,
    });
    setActionError("");
    setRescheduleOpen(false);
  }, [date, router]);

  const handleDateChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", next);
      params.delete("reservation");
      router.replace(`/reservations?${params.toString()}`, { scroll: false });
      setActionError("");
    },
    [router, searchParams],
  );

  const syncAfterMutation = useCallback(
    (reservation: Reservation) => {
      list.upsertItem(reservation);
      detail.setLocal(reservation);
      if (view === "mapping") {
        reloadDay();
      }
    },
    [detail, list, reloadDay, view],
  );

  const runAction = useCallback(
    async (action: "confirm" | "cancel" | "complete") => {
      if (!selectedId) {
        return;
      }
      setBusyAction(action);
      setActionError("");
      try {
        const updated =
          action === "confirm"
            ? await confirmReservation(selectedId)
            : action === "cancel"
              ? await cancelReservation(selectedId)
              : await completeReservation(selectedId);
        syncAfterMutation(updated);
        await detail.refetch();
      } catch (err) {
        setActionError(
          reservationErrorMessage(
            err,
            action === "confirm"
              ? "This reservation could not be confirmed."
              : action === "cancel"
                ? "Couldn't cancel reservation."
                : "Couldn't complete reservation.",
          ),
        );
      } finally {
        setBusyAction(null);
      }
    },
    [detail, selectedId, syncAfterMutation],
  );

  const runPaymentAction = useCallback(
    async (
      action: "pay-create" | "pay-confirm" | "pay-full" | "pay-refund",
    ) => {
      if (!selectedId) {
        return;
      }
      setBusyAction(action);
      setActionError("");
      try {
        if (action === "pay-create") {
          const created = await createReservationPayment(selectedId);
          detail.setLocalPayment(created);
        } else {
          const paymentId = detail.payment?.id;
          if (!paymentId) {
            throw new Error("missing payment");
          }
          const updated =
            action === "pay-confirm"
              ? await confirmReservationPayment(paymentId)
              : action === "pay-full"
                ? await markReservationPaymentFull(paymentId)
                : await refundReservationPayment(paymentId);
          detail.setLocalPayment(updated);
        }
        await detail.refetch();
        if (view === "mapping") {
          reloadDay();
        }
      } catch (err) {
        setActionError(
          reservationErrorMessage(
            err,
            action === "pay-create"
              ? "Couldn't create payment record."
              : action === "pay-confirm"
                ? "Couldn't mark payment as paid."
                : action === "pay-full"
                  ? "Couldn't record the full payment."
                  : "Couldn't refund payment.",
          ),
        );
      } finally {
        setBusyAction(null);
      }
    },
    [detail, reloadDay, selectedId, view],
  );

  const showMobileDetail = Boolean(selectedId);
  const dayLoading = view === "mapping" && dayLoadedFor !== date;

  if (business.loading || !date) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-24 w-full max-w-md animate-pulse rounded-2xl bg-surface-container-low" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
        <div className="min-w-0 lg:hidden">
          <h2 className="text-base font-semibold text-on-surface">Reservations</h2>
          <p className="text-xs text-on-surface-variant">
            Manage bookings, availability, and table assignments.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-outline-variant bg-background p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                view === "list"
                  ? "bg-surface text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView("mapping")}
              className={cn(
                "min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                view === "mapping"
                  ? "bg-surface text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              Mapping
            </button>
          </div>
          <Button
            className="w-auto min-w-0 px-3 sm:px-4"
            onClick={() => {
              setCreateKey((key) => key + 1);
              setCreateOpen(true);
            }}
          >
            <Icon name="add" size={18} />
            <span className="hidden sm:inline">Reservation</span>
          </Button>
        </div>
      </div>

      <ReservationFilters
        date={date}
        timezone={business.timezone}
        status={status}
        search={search}
        onDateChange={handleDateChange}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
      />

      {business.error ? (
        <p className="border-b border-outline-variant bg-warning/10 px-4 py-2 text-sm text-on-surface">
          {business.error}
        </p>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            "absolute inset-0 grid min-h-0 lg:grid-cols-[minmax(280px,1fr)_minmax(320px,1.1fr)]",
            showMobileDetail ? "max-lg:hidden" : "",
          )}
        >
          <section className="min-h-0 overflow-y-auto border-r border-outline-variant bg-background">
            {view === "list" ? (
              <div className="p-4">
                <ReservationList
                  items={filteredItems}
                  timezone={business.timezone}
                  selectedId={selectedId}
                  loading={list.loading}
                  error={list.error}
                  hasMore={list.hasMore}
                  loadingMore={list.loadingMore}
                  onSelect={selectReservation}
                  onLoadMore={() => void list.loadMore()}
                  onRetry={() => void list.refetch()}
                />
              </div>
            ) : (
              <TableMapping
                floor={floorPlan.floor}
                floorLoading={floorPlan.loading}
                floorError={floorPlan.error}
                onRetryFloor={() => void floorPlan.refetch()}
                day={dayLoadedFor === date ? day : null}
                dayLoading={dayLoading}
                dayError={dayLoadedFor === date ? dayError : ""}
                onRetryDay={reloadDay}
                date={date}
                timezone={day?.timezone || business.timezone}
                selectedId={selectedId}
                onSelect={selectReservation}
              />
            )}
          </section>

          <section className="hidden min-h-0 overflow-hidden bg-surface lg:block">
            <ReservationDetail
              reservation={detail.reservation}
              payment={detail.payment}
              paymentMissing={detail.paymentMissing}
              depositEnabled={business.depositEnabled}
              timezone={business.timezone}
              loading={Boolean(selectedId) && detail.loading}
              error={detail.error}
              actionError={actionError}
              busyAction={busyAction}
              onConfirm={() => void runAction("confirm")}
              onCancel={() => void runAction("cancel")}
              onComplete={() => void runAction("complete")}
              onReschedule={() => {
                setRescheduleKey((key) => key + 1);
                setRescheduleOpen(true);
              }}
              onMarkPaid={() => void runPaymentAction("pay-confirm")}
              onPayFull={() => void runPaymentAction("pay-full")}
              onRefundPayment={() => void runPaymentAction("pay-refund")}
              onCreatePayment={() => void runPaymentAction("pay-create")}
              onRetry={() => void detail.refetch()}
            />
          </section>
        </div>

        <div
          className={cn(
            "absolute inset-0 bg-surface lg:hidden",
            showMobileDetail ? "block" : "hidden",
          )}
        >
          <ReservationDetail
            reservation={detail.reservation}
            payment={detail.payment}
            paymentMissing={detail.paymentMissing}
            depositEnabled={business.depositEnabled}
            timezone={business.timezone}
            loading={Boolean(selectedId) && detail.loading}
            error={detail.error}
            actionError={actionError}
            busyAction={busyAction}
            onBack={clearSelection}
            onConfirm={() => void runAction("confirm")}
            onCancel={() => void runAction("cancel")}
            onComplete={() => void runAction("complete")}
            onReschedule={() => {
              setRescheduleKey((key) => key + 1);
              setRescheduleOpen(true);
            }}
            onMarkPaid={() => void runPaymentAction("pay-confirm")}
            onPayFull={() => void runPaymentAction("pay-full")}
            onRefundPayment={() => void runPaymentAction("pay-refund")}
            onCreatePayment={() => void runPaymentAction("pay-create")}
            onRetry={() => void detail.refetch()}
          />
        </div>
      </div>

      <ReservationForm
        key={`create-${createKey}`}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        timezone={business.timezone}
        slotDuration={business.slotDuration}
        minParty={business.minParty}
        maxParty={business.maxParty}
        onCreated={(reservation) => {
          const createdDate = formatBusinessDate(
            reservation.start_at,
            business.timezone,
          );
          list.upsertItem(reservation);
          const params = new URLSearchParams();
          params.set("date", createdDate);
          params.set("reservation", reservation.id);
          router.replace(`/reservations?${params.toString()}`, {
            scroll: false,
          });
          if (view === "mapping") {
            reloadDay();
          }
        }}
      />

      {detail.reservation ? (
        <RescheduleDialog
          key={`reschedule-${rescheduleKey}`}
          open={rescheduleOpen}
          reservation={detail.reservation}
          timezone={business.timezone}
          slotDuration={business.slotDuration}
          minParty={business.minParty}
          maxParty={business.maxParty}
          onClose={() => setRescheduleOpen(false)}
          onRescheduled={(reservation) => {
            syncAfterMutation(reservation);
            void detail.refetch();
          }}
        />
      ) : null}
    </div>
  );
}
