import { ApiError } from "@/lib/api/errors";

const MESSAGES: Record<string, string> = {
  AREA_NAME_ALREADY_EXISTS: "An area with this name already exists.",
  TABLE_NAME_ALREADY_EXISTS:
    "A table with this name already exists in this area.",
  AREA_HAS_ACTIVE_TABLES:
    "This area still has active tables. Deactivate or remove the tables first.",
  AREA_INACTIVE: "This area is not active.",
  NOT_FOUND: "The requested area or table was not found.",
  BAD_REQUEST: "Check the form and try again.",
};

export function areaErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) {
      return MESSAGES[error.code];
    }
    if (error.code === "BAD_REQUEST" && error.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes("capacity")) {
        return "Capacity must be at least 1.";
      }
      if (msg.includes("name is required")) {
        return "Name is required.";
      }
      if (msg.includes("100")) {
        return "Name must be at most 100 characters.";
      }
      return error.message;
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
