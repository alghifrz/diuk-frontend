export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function toUserMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code === "NO_WORKSPACE") {
      return "Workspace is not configured yet.";
    }
    if (error.status === 401) {
      return "Your session expired. Please sign in again.";
    }
    if (error.status === 403) {
      return "You do not have permission to do that.";
    }
    if (error.code === "CHANNEL_QUOTA_EXCEEDED") {
      return "WhatsApp channel limit reached.";
    }
    if (error.code === "RESERVATION_PAYMENT_REQUIRED") {
      return "Payment is required before this reservation can be confirmed.";
    }
  }

  return fallback;
}
