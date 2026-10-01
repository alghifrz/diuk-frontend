"use client";

import { useEffect, useState } from "react";
import { checkAvailability } from "@/lib/api/reservations";
import { reservationErrorMessage } from "@/lib/reservation-errors";
import type { Availability } from "@/types/reservation";

type AvailabilityInput = {
  date: string;
  start_time: string;
  party_size: number;
  duration_minutes?: number;
  enabled?: boolean;
};

export function useAvailability({
  date,
  start_time,
  party_size,
  duration_minutes,
  enabled = true,
}: AvailabilityInput) {
  const [data, setData] = useState<Availability | null>(null);
  const [requestKey, setRequestKey] = useState("");
  const [error, setError] = useState("");

  const valid =
    enabled &&
    Boolean(date) &&
    /^\d{2}:\d{2}$/.test(start_time) &&
    Number.isFinite(party_size) &&
    party_size > 0;

  const currentKey = valid
    ? `${date}|${start_time}|${party_size}|${duration_minutes ?? ""}`
    : "";

  useEffect(() => {
    if (!valid) {
      return;
    }

    let cancelled = false;
    const key = currentKey;

    const timer = window.setTimeout(() => {
      checkAvailability({
        date,
        start_time,
        party_size,
        duration_minutes,
      })
        .then((result) => {
          if (cancelled) {
            return;
          }
          setData(result);
          setError("");
          setRequestKey(key);
        })
        .catch((err: unknown) => {
          if (cancelled) {
            return;
          }
          setData(null);
          setError(
            reservationErrorMessage(err, "Couldn't check availability."),
          );
          setRequestKey(key);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [currentKey, date, duration_minutes, party_size, start_time, valid]);

  const loading = valid && requestKey !== currentKey;

  return {
    data: valid && !loading ? data : null,
    loading,
    error: valid && !loading ? error : "",
    valid,
  };
}
