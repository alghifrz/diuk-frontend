"use client";

import { useCallback, useEffect, useState } from "react";
import { getReservation } from "@/lib/api/reservations";
import { getReservationPayment } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/errors";
import { reservationErrorMessage } from "@/lib/reservation-errors";
import type { Reservation, ReservationPayment } from "@/types/reservation";

export function useReservation(id: string | null) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [payment, setPayment] = useState<ReservationPayment | null>(null);
  const [paymentMissing, setPaymentMissing] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    Promise.all([
      getReservation(id),
      getReservationPayment(id).catch((err: unknown) => {
        if (err instanceof ApiError && err.code === "PAYMENT_NOT_FOUND") {
          return null;
        }
        throw err;
      }),
    ])
      .then(([detail, pay]) => {
        if (cancelled) {
          return;
        }
        setReservation(detail);
        setPayment(pay);
        setPaymentMissing(pay === null);
        setError("");
        setLoadedFor(id);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setReservation(null);
        setPayment(null);
        setPaymentMissing(false);
        setError(
          reservationErrorMessage(err, "Couldn't load reservation details."),
        );
        setLoadedFor(id);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const ready = Boolean(id) && loadedFor === id;

  const setLocal = useCallback((next: Reservation) => {
    setReservation(next);
  }, []);

  const setLocalPayment = useCallback((next: ReservationPayment | null) => {
    setPayment(next);
    setPaymentMissing(next === null);
  }, []);

  const refetch = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      const [detail, pay] = await Promise.all([
        getReservation(id),
        getReservationPayment(id).catch((err: unknown) => {
          if (err instanceof ApiError && err.code === "PAYMENT_NOT_FOUND") {
            return null;
          }
          throw err;
        }),
      ]);
      setReservation(detail);
      setPayment(pay);
      setPaymentMissing(pay === null);
      setError("");
      setLoadedFor(id);
    } catch (err) {
      setError(
        reservationErrorMessage(err, "Couldn't load reservation details."),
      );
      setLoadedFor(id);
    }
  }, [id]);

  return {
    reservation: ready ? reservation : null,
    payment: ready ? payment : null,
    paymentMissing: ready ? paymentMissing : false,
    loading: Boolean(id) && !ready,
    error: ready ? error : "",
    setLocal,
    setLocalPayment,
    refetch,
  };
}
