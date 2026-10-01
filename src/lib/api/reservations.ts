import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  Availability,
  CreateReservationInput,
  ListReservationsParams,
  Reservation,
  RescheduleReservationInput,
} from "@/types/reservation";

export function listReservations(
  params: ListReservationsParams | string = {},
) {
  const query =
    typeof params === "string"
      ? { customer_id: params, limit: 5 }
      : {
          status: params.status || undefined,
          customer_id: params.customer_id,
          table_id: params.table_id,
          date: params.date,
          start_date: params.start_date,
          end_date: params.end_date,
          limit: params.limit,
          offset: params.offset,
        };

  return apiRequest<Reservation[]>(`/api/v1/reservations${toQuery(query)}`);
}

export function getReservation(id: string) {
  return apiRequest<Reservation>(`/api/v1/reservations/${id}`);
}

export function checkAvailability(params: {
  date: string;
  start_time: string;
  party_size: number;
  duration_minutes?: number;
}) {
  return apiRequest<Availability>(
    `/api/v1/reservations/availability${toQuery({
      date: params.date,
      start_time: params.start_time,
      party_size: params.party_size,
      duration_minutes: params.duration_minutes,
    })}`,
  );
}

export function createReservation(input: CreateReservationInput) {
  return apiRequest<Reservation>("/api/v1/reservations", {
    method: "POST",
    body: JSON.stringify({
      customer_id: input.customer_id,
      start_at: input.start_at,
      end_at: input.end_at,
      party_size: input.party_size,
      table_id: input.table_id ?? null,
      notes: input.notes ?? null,
    }),
  });
}

export function confirmReservation(id: string) {
  return apiRequest<Reservation>(`/api/v1/reservations/${id}/confirm`, {
    method: "POST",
  });
}

export function cancelReservation(id: string, reason?: string) {
  return apiRequest<Reservation>(`/api/v1/reservations/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export function completeReservation(id: string) {
  return apiRequest<Reservation>(`/api/v1/reservations/${id}/complete`, {
    method: "POST",
  });
}

export function rescheduleReservation(
  id: string,
  input: RescheduleReservationInput,
) {
  return apiRequest<Reservation>(`/api/v1/reservations/${id}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify({
      start_at: input.start_at,
      end_at: input.end_at,
      party_size: input.party_size,
      table_id: input.table_id ?? undefined,
    }),
  });
}
