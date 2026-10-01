import { ApiError } from "@/lib/api/errors";

const MESSAGES: Record<string, string> = {
  RESERVATION_PAYMENT_REQUIRED:
    "Payment is required before this reservation can be confirmed.",
  RESERVATION_FULL_PAYMENT_REQUIRED:
    "Record the remaining balance (Pay in full) before completing this reservation.",
  RESERVATION_DISABLED: "Reservations are disabled for this business.",
  RESERVATION_INVALID_STATUS: "This action is not valid for the current status.",
  RESERVATION_OUTSIDE_OPERATING_HOURS:
    "This time is outside operating hours.",
  RESERVATION_OUTSIDE_ADVANCE_WINDOW:
    "This time is outside the advance booking window.",
  RESERVATION_PARTY_SIZE_INVALID: "Party size is not allowed.",
  RESERVATION_TABLE_INACTIVE: "The selected table is not active.",
  RESERVATION_AREA_INACTIVE: "The selected area is not active.",
  RESERVATION_TABLE_CAPACITY_INSUFFICIENT:
    "The selected table cannot seat this party.",
  RESERVATION_TABLE_UNAVAILABLE: "This time is no longer available.",
  RESERVATION_NO_TABLE_AVAILABLE: "No table is available for this time.",
  RESERVATION_INVALID_TIME_RANGE: "The reservation time range is invalid.",
  RESERVATION_CROSS_MIDNIGHT: "Reservations must stay on one local date.",
  RESERVATION_CUSTOMER_INACTIVE: "This customer is not active.",
  RESERVATION_CUSTOMER_NOT_FOUND: "Customer not found.",
  RESERVATION_TABLE_NOT_FOUND: "Table not found.",
  RESERVATION_NOT_FOUND: "Reservation not found.",
  RESERVATION_RESCHEDULE_NOT_ALLOWED:
    "This reservation cannot be rescheduled.",
  RESERVATION_RESCHEDULE_CONFLICT: "This time is no longer available.",
  CALENDAR_BLOCKED: "This time is blocked on the calendar.",
  PAYMENT_NOT_FOUND: "No payment record for this reservation.",
  PAYMENT_ALREADY_PAID: "This payment is already marked as paid.",
  PAYMENT_ALREADY_REFUNDED: "This payment is already refunded.",
  PAYMENT_ALREADY_EXISTS: "This reservation already has a payment record.",
  PAYMENT_INVALID_STATE: "That payment status change is not allowed.",
  PAYMENT_RESERVATION_NOT_FOUND: "Reservation not found for this payment.",
};

export function reservationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) {
      return MESSAGES[error.code];
    }
    if (error.status === 401) {
      return "Your session expired. Please sign in again.";
    }
    if (error.status === 403) {
      return "You do not have permission to do that.";
    }
  }

  return fallback;
}

export function isAvailabilityConflict(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === "RESERVATION_TABLE_UNAVAILABLE" ||
    error.code === "RESERVATION_NO_TABLE_AVAILABLE" ||
    error.code === "RESERVATION_RESCHEDULE_CONFLICT" ||
    error.code === "CALENDAR_BLOCKED"
  );
}
