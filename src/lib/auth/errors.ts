const GENERIC_AUTH_ERROR = "Something went wrong. Please try again.";

export function mapAuthError(error: { message?: string; code?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  const code = error?.code?.toLowerCase() ?? "";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid_credentials") ||
    code === "invalid_credentials"
  ) {
    return "Invalid login credentials";
  }

  if (message.includes("email not confirmed") || code === "email_not_confirmed") {
    return "Please confirm your email before signing in.";
  }

  if (message.includes("too many requests") || code === "over_request_rate_limit") {
    return "Too many attempts. Please try again later.";
  }

  if (message.includes("provider is not enabled") || message.includes("unsupported provider")) {
    return "Google sign-in is not available for this workspace.";
  }

  return GENERIC_AUTH_ERROR;
}
