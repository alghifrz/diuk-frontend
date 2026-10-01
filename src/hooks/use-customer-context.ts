"use client";

import { useEffect, useState } from "react";
import { getCustomer } from "@/lib/api/customers";
import { listReservations } from "@/lib/api/reservations";
import { toUserMessage } from "@/lib/api/errors";
import type { Customer, Reservation } from "@/types/customer";

export function useCustomerContext(customerId: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) {
      return;
    }

    let cancelled = false;

    Promise.allSettled([getCustomer(customerId), listReservations(customerId)]).then(
      ([customerResult, reservationResult]) => {
        if (cancelled) {
          return;
        }

        if (customerResult.status === "fulfilled") {
          setCustomer(customerResult.value);
          setError("");
        } else {
          setCustomer(null);
          setError(toUserMessage(customerResult.reason, "Couldn't load customer details."));
        }

        setReservations(
          reservationResult.status === "fulfilled" ? reservationResult.value : null,
        );
        setLoadedFor(customerId);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const ready = loadedFor === customerId;

  return {
    customer: ready ? customer : null,
    reservations: ready ? reservations : null,
    loading: Boolean(customerId) && !ready,
    error: customerId ? error : "",
  };
}
