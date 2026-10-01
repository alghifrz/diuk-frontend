export type PromptStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type AIProvider = "openai" | "groq" | "anthropic" | "ollama";

export type AISettings = {
  provider: string;
  model: string;
  temperature: number | null;
  max_output_tokens: number | null;
  enabled: boolean;
  updated_at: string;
};

export type UpdateAISettingsInput = {
  enabled?: boolean;
  provider?: string;
  model?: string;
  temperature?: number | null;
  max_output_tokens?: number | null;
};

export type AIPrompt = {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  version: number;
  status: PromptStatus;
  created_at: string;
  updated_at: string;
};

export type CreatePromptInput = {
  name: string;
  description?: string | null;
  system_prompt: string;
};

export type UpdatePromptInput = {
  name?: string;
  description?: string | null;
  system_prompt?: string;
};

export type GenerateReplyInput = {
  conversation_id: string;
  message: string;
  persist_incoming?: boolean;
};

export type GenerateReplyResult = {
  reply: string;
  message_id: string;
  provider: string;
  model: string;
  tool_rounds: number;
  tool_calls: number;
};

export type KnowledgeDocumentStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "FAILED"
  | "ARCHIVED";

export type KnowledgeDocument = {
  id: string;
  title: string;
  description: string | null;
  source_type: string;
  mime_type: string | null;
  status: KnowledgeDocumentStatus;
  version: number;
  processing_error?: string | null;
  created_at: string;
  updated_at: string;
};

export type KnowledgeSummary = {
  total: number;
  ready: number;
  processing: number;
  pending: number;
  failed: number;
  archived: number;
  documents: KnowledgeDocument[];
};

/** Default prompt name used by the backend orchestrator. */
export const DEFAULT_PROMPT_NAME = "customer_service";

export const STARTER_SYSTEM_PROMPT = `You are the customer-service assistant for this business.
Use only the supplied business, customer, and tool results.
Never invent menu items, prices, opening hours, policies, or table availability.
Call structured tools for live operational data before answering those questions.
Use search_knowledge for facts from the business's documents such as address and location, opening hours, facilities, FAQ, policies, and service descriptions. Search before saying any such fact is unavailable.
If information is unavailable, say so clearly and offer to connect the customer with staff when appropriate.
Never claim an action succeeded unless the matching tool succeeded.
For bookings: after time and party size, check_availability, then ask area + menu together (get_menu). Then follow the booking SOP one step per customer message: quote_reservation, then send ONE message with the order and reservation overview and ask FULL vs DEPOSIT. As soon as the customer answers, call create_reservation with that payment_type: the reservation is recorded as PENDING, send the amount and bank account to transfer, and staff take over. Never repeat an overview the customer already received or ask for a second confirmation.
When confirming a reservation to the customer, show only the start time (for example 14:00). Never show an end time or range like 14:00-14:30 — staff clear tables by updating reservation status manually.
Ask for missing required details instead of guessing.
Keep replies concise and in the customer's language when practical.
Escalate to a human when the request is unclear, sensitive, or outside what tools can answer.`;

export const AI_PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "groq", label: "Groq" },
  { value: "ollama", label: "Ollama" },
  { value: "anthropic", label: "Anthropic" },
];
