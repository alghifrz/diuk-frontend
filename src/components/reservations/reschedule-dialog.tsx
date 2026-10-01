"use client";

import { useMemo, useState } from "react";
import { AvailabilityPicker } from "@/components/reservations/availability-picker";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAvailability } from "@/hooks/use-availability";
import { rescheduleReservation } from "@/lib/api/reservations";
import {
  addMinutesIso,
  businessLocalToIso,
  formatBusinessDate,
  formatBusinessTime,
  minutesBetween,
} from "@/lib/business-time";
import {
  isAvailabilityConflict,
  reservationErrorMessage,
} from "@/lib/reservation-errors";
import type { Reservation } from "@/types/reservation";

type RescheduleDialogProps = {
  open: boolean;
  reservation: Reservation;
  timezone: string;
  slotDuration: number;
  minParty: number;
  maxParty: number;
  onClose: () => void;
  onRescheduled: (reservation: Reservation) => void;
};

export function RescheduleDialog({
  open,
  reservation,
  timezone,
  slotDuration,
  minParty,
  maxParty,
  onClose,
  onRescheduled,
}: RescheduleDialogProps) {
  const existingDuration = Math.max(
    minutesBetween(reservation.start_at, reservation.end_at),
    slotDuration,
  );

  const [date, setDate] = useState(() =>
    formatBusinessDate(reservation.start_at, timezone),
  );
  const [startTime, setStartTime] = useState(() =>
    formatBusinessTime(reservation.start_at, timezone),
  );
  const [partySize, setPartySize] = useState(reservation.party_size);
  const [tableId, setTableId] = useState<string | null>(reservation.table_id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availability = useAvailability({
    date,
    start_time: startTime,
    party_size: partySize,
    duration_minutes: existingDuration,
    enabled: open && Boolean(date) && Boolean(startTime),
  });

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
    return addMinutesIso(startAt, existingDuration);
  }, [existingDuration, startAt]);

  const requireTable = reservation.status === "CONFIRMED";

  async function handleSubmit() {
    if (!startAt || !endAt) {
      return;
    }
    if (requireTable && !tableId) {
      setError("Confirmed reservations must keep a table.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updated = await rescheduleReservation(reservation.id, {
        start_at: startAt,
        end_at: endAt,
        party_size: partySize,
        table_id: tableId,
      });
      onRescheduled(updated);
      onClose();
    } catch (err) {
      setError(
        reservationErrorMessage(err, "Couldn't reschedule reservation."),
      );
      if (isAvailabilityConflict(err)) {
        setTableId(null);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reschedule"
      description="Availability is checked by the backend. Payment state is preserved."
      size="lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            className="sm:w-auto"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </Button>
          <Button
            className="sm:w-auto"
            loading={submitting}
            onClick={() => void handleSubmit()}
            disabled={availability.loading || (requireTable && !tableId)}
          >
            Save changes
          </Button>
        </div>
      }
    >
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-error/10 px-3 py-2 text-sm text-error"
        >
          {error}
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
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
        <p className="self-end text-xs text-on-surface-variant sm:col-span-1">
          Duration stays {existingDuration} minutes.
        </p>
      </div>

      <AvailabilityPicker
        data={availability.data}
        loading={availability.loading}
        error={availability.error}
        selectedTableId={tableId}
        allowNoTable={!requireTable}
        onSelect={setTableId}
      />
    </Dialog>
  );
}
