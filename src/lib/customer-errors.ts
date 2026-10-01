import { ApiError } from "@/lib/api/errors";

const MESSAGES: Record<string, string> = {
  CUSTOMER_NOT_FOUND: "Customer not found.",
  CUSTOMER_INACTIVE: "This customer is archived.",
  TAG_NOT_FOUND: "Tag not found.",
  TAG_INACTIVE: "This tag is no longer active.",
  TAG_NAME_ALREADY_EXISTS: "A tag with that name already exists.",
  CUSTOMER_TAG_ALREADY_EXISTS: "This customer already has that tag.",
  IDENTITY_ALREADY_EXISTS: "That channel account is already linked.",
};

export function customerErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) {
      return MESSAGES[error.code];
    }
    if (error.code === "BAD_REQUEST" && error.message) {
      return capitalize(error.message);
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
