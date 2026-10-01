"use client";

import { useCallback, useEffect, useState } from "react";
import { getCustomer } from "@/lib/api/customers";
import { listReservations } from "@/lib/api/reservations";
import { customerErrorMessage } from "@/lib/customer-errors";
import type { Customer } from "@/types/customer";
import type { Reservation } from "@/types/reservation";

type DetailState = {
  customerId: string;
  customer: Customer | null;
  reservations: Reservation[] | null;
  error: string;
};

export function useCustomerDetail(customerId: string | null) {
  const [state, setState] = useState<DetailState | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!customerId) {
      return;
    }

    let cancelled = false;

    Promise.allSettled([
      getCustomer(customerId),
      listReservations({ customer_id: customerId, limit: 50 }),
    ]).then(([customerResult, reservationResult]) => {
      if (cancelled) {
        return;
      }

      const reservations =
        reservationResult.status === "fulfilled"
          ? [...reservationResult.value].sort(
              (a, b) =>
                new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
            )
          : null;

      setState({
        customerId,
        customer:
          customerResult.status === "fulfilled" ? customerResult.value : null,
        reservations,
        error:
          customerResult.status === "fulfilled"
            ? ""
            : customerErrorMessage(
                customerResult.reason,
                "Couldn't load this customer.",
              ),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [customerId, reloadToken]);

  const setLocal = useCallback((customer: Customer) => {
    setState((prev) =>
      prev && prev.customerId === customer.id
        ? { ...prev, customer, error: "" }
        : prev,
    );
  }, []);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const ready = Boolean(customerId) && state?.customerId === customerId;

  return {
    customer: ready ? state!.customer : null,
    reservations: ready ? state!.reservations : null,
    error: ready ? state!.error : "",
    loading: Boolean(customerId) && !ready,
    setLocal,
    refetch,
  };
}
