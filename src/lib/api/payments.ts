import { apiRequest } from "@/lib/api/client";
import type { ReservationPayment } from "@/types/reservation";

export function getReservationPayment(reservationId: string) {
  return apiRequest<ReservationPayment>(
    `/api/v1/reservations/${reservationId}/payment`,
  );
}

export function createReservationPayment(
  reservationId: string,
  notes?: string | null,
) {
  return apiRequest<ReservationPayment>(
    `/api/v1/reservations/${reservationId}/payment`,
    {
      method: "POST",
      body: JSON.stringify(notes ? { notes } : {}),
    },
  );
}

export function confirmReservationPayment(
  paymentId: string,
  notes?: string | null,
) {
  return apiRequest<ReservationPayment>(
    `/api/v1/reservation-payments/${paymentId}/confirm`,
    {
      method: "POST",
      body: JSON.stringify(notes ? { notes } : {}),
    },
  );
}

/** Settle the remaining balance: a deposit payment becomes a full payment. */
export function markReservationPaymentFull(
  paymentId: string,
  notes?: string | null,
) {
  return apiRequest<ReservationPayment>(
    `/api/v1/reservation-payments/${paymentId}/mark-full`,
    {
      method: "POST",
      body: JSON.stringify(notes ? { notes } : {}),
    },
  );
}

export function refundReservationPayment(
  paymentId: string,
  notes?: string | null,
) {
  return apiRequest<ReservationPayment>(
    `/api/v1/reservation-payments/${paymentId}/refund`,
    {
      method: "POST",
      body: JSON.stringify(notes ? { notes } : {}),
    },
  );
}
