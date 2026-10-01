import { ApiError } from "@/lib/api/errors";

const MESSAGES: Record<string, string> = {
  AI_DISABLED: "AI Assistant is turned off for this business.",
  AI_PROVIDER_NOT_CONFIGURED: "AI provider is not configured.",
  AI_PROVIDER_ERROR: "The AI provider returned an error. Try again later.",
  AI_INVALID_RESPONSE: "The AI response was invalid. Try again.",
  AI_QUOTA_EXCEEDED:
    "Your AI response limit has been reached for this billing period.",
  AI_PROMPT_NOT_FOUND: "Prompt not found.",
  AI_SETTINGS_NOT_FOUND: "AI settings not found.",
  PROMPT_NOT_DRAFT: "Only draft prompts can be edited. Create a new draft first.",
  CONVERSATION_NOT_FOUND: "Conversation not found.",
  HUMAN_HANDLING_ACTIVE:
    "This conversation is handled by a human. Choose an AI-active conversation.",
  AI_TOOL_LIMIT_EXCEEDED: "The AI hit its tool-call limit for this reply.",
  AI_CONTEXT_ERROR: "Couldn't build AI context for this conversation.",
  AI_TOOL_EXECUTION_FAILED: "An AI tool failed while generating the reply.",
};

export function aiErrorMessage(error: unknown, fallback: string): string {
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
    if (error.message && error.message !== "request failed") {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
