"use client";

import { useEffect, useMemo, useState } from "react";
import { AvailabilityPicker } from "@/components/reservations/availability-picker";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAvailability } from "@/hooks/use-availability";
import { useDebounce } from "@/hooks/use-debounce";
import { listCustomers } from "@/lib/api/customers";
import { createReservation } from "@/lib/api/reservations";
import {
  addMinutesIso,
  businessLocalToIso,
  businessToday,
} from "@/lib/business-time";
import {
  isAvailabilityConflict,
  reservationErrorMessage,
} from "@/lib/reservation-errors";
import { cn } from "@/lib/cn";
import type { Customer } from "@/types/customer";
import type { Reservation } from "@/types/reservation";

type ReservationFormProps = {
  open: boolean;
  onClose: () => void;
  timezone: string;
  slotDuration: number;
  minParty: number;
  maxParty: number;
  onCreated: (reservation: Reservation) => void;
};

type Step = 1 | 2 | 3 | 4;

export function ReservationForm({
  open,
  onClose,
  timezone,
  slotDuration,
  minParty,
  maxParty,
  onCreated,
}: ReservationFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [customerQuery, setCustomerQuery] = useState("");
  const debouncedQuery = useDebounce(customerQuery.trim(), 300);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoadedFor, setCustomersLoadedFor] = useState<string | null>(
    null,
  );
  const [customerError, setCustomerError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [date, setDate] = useState(() => businessToday(timezone));
  const [startTime, setStartTime] = useState("19:00");
  const [partySize, setPartySize] = useState(minParty);
  const [notes, setNotes] = useState("");
  const [tableId, setTableId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const availability = useAvailability({
    date,
    start_time: startTime,
    party_size: partySize,
    duration_minutes: slotDuration,
    enabled: open && step >= 3 && Boolean(date) && Boolean(startTime),
  });

  const customerRequestKey = open && step === 1 ? debouncedQuery : null;

  useEffect(() => {
    if (customerRequestKey === null) {
      return;
    }

    let cancelled = false;

    listCustomers({
      search: customerRequestKey || undefined,
      status: "ACTIVE",
      limit: 20,
      offset: 0,
    })
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setCustomers(rows);
        setCustomerError("");
        setCustomersLoadedFor(customerRequestKey);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setCustomers([]);
        setCustomerError("Couldn't load customers.");
        setCustomersLoadedFor(customerRequestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [customerRequestKey]);

  const customersLoading =
    customerRequestKey !== null && customersLoadedFor !== customerRequestKey;

  const startAt = useMemo(() => {
    if (!date || !startTime) {
      return "";
    }
    return businessLocalToIso(date, startTime, timezone);
  }, [date, startTime, timezone]);

  const endAt = useMemo(() => {
    if (!startAt) {
      return "";
    }
    return addMinutesIso(startAt, slotDuration);
  }, [slotDuration, startAt]);

  async function handleCreate() {
    if (!selectedCustomer || !startAt || !endAt) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const created = await createReservation({
        customer_id: selectedCustomer.id,
        start_at: startAt,
        end_at: endAt,
        party_size: partySize,
        table_id: tableId,
        notes: notes.trim() || null,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setSubmitError(
        reservationErrorMessage(err, "Couldn't create reservation."),
      );
      if (isAvailabilityConflict(err)) {
        setStep(3);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const selectedTable = availability.data?.tables.find(
    (table) => table.table_id === tableId,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New reservation"
      description="Check availability through the backend before assigning a table."
      size="lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            className="sm:w-auto"
            onClick={() => {
              if (step === 1) {
                onClose();
                return;
              }
              setStep((prev) => (prev - 1) as Step);
            }}
            disabled={submitting}
          >
            {step === 1 ? "Close" : "Back"}
          </Button>
          {step < 4 ? (
            <Button
              className="sm:w-auto"
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              disabled={
                (step === 1 && !selectedCustomer) ||
                (step === 2 && (!date || !startTime || partySize < 1)) ||
                (step === 3 && availability.loading)
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              className="sm:w-auto"
              loading={submitting}
              onClick={() => void handleCreate()}
            >
              Create reservation
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((value) => (
          <span
            key={value}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step >= value ? "bg-primary" : "bg-outline-variant",
            )}
          />
        ))}
      </div>

      {submitError ? (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-error/10 px-3 py-2 text-sm text-error"
        >
          {submitError}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <Input
            label="Search customers"
            value={customerQuery}
            onChange={(event) => setCustomerQuery(event.target.value)}
            placeholder="Name or phone"
            leadingIcon="search"
          />
          {customerError ? (
            <p className="text-sm text-error">{customerError}</p>
          ) : null}
          {customersLoading ? (
            <div className="space-y-2" aria-label="Loading customers">
              <div className="h-12 animate-pulse rounded-xl bg-surface-container-low" />
              <div className="h-12 animate-pulse rounded-xl bg-surface-container-low" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No customers found. Create a customer first, then book.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {customers.map((customer) => {
                const selected = selectedCustomer?.id === customer.id;
                return (
                  <li key={customer.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className={cn(
                        "flex w-full flex-col rounded-xl border px-3 py-2.5 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant hover:bg-background",
                      )}
                    >
                      <span className="text-sm font-medium text-on-surface">
                        {customer.name}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {customer.phone || customer.email || customer.id}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setTableId(null);
            }}
          />
          <Input
            label="Start time"
            type="time"
            value={startTime}
            onChange={(event) => {
              setStartTime(event.target.value);
              setTableId(null);
            }}
          />
          <Input
            label="Party size"
            type="number"
            min={minParty}
            max={maxParty}
            value={partySize}
            onChange={(event) => {
              setPartySize(Number(event.target.value) || minParty);
              setTableId(null);
            }}
          />
          <div className="sm:col-span-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-on-surface">Notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </label>
          </div>
          <p className="text-xs text-on-surface-variant sm:col-span-2">
            Slot duration: {slotDuration} minutes (from business settings).
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <AvailabilityPicker
          data={availability.data}
          loading={availability.loading}
          error={availability.error}
          selectedTableId={tableId}
          allowNoTable
          onSelect={setTableId}
        />
      ) : null}

      {step === 4 ? (
        <div className="space-y-3 rounded-2xl border border-outline-variant bg-background p-4 text-sm">
          <p>
            <span className="text-on-surface-variant">Customer</span>
            <br />
            <span className="font-semibold text-on-surface">
              {selectedCustomer?.name}
            </span>
          </p>
          <p>
            <span className="text-on-surface-variant">When</span>
            <br />
            <span className="font-semibold text-on-surface">
              {date} · {startTime} · {partySize} guests
            </span>
          </p>
          <p>
            <span className="text-on-surface-variant">Table</span>
            <br />
            <span className="font-semibold text-on-surface">
              {selectedTable
                ? `${selectedTable.area_name} · ${selectedTable.table_name}`
                : "No table assigned"}
            </span>
          </p>
          {notes.trim() ? (
            <p>
              <span className="text-on-surface-variant">Notes</span>
              <br />
              <span className="text-on-surface">{notes.trim()}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
