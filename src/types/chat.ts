export type ConversationStatus = "OPEN" | "CLOSED";

export type HandlingState =
  | "AI_ACTIVE"
  | "HUMAN_REQUESTED"
  | "HUMAN_ACTIVE"
  | "RESOLVED";

export type ConversationChannel = "WHATSAPP" | "INSTAGRAM" | "WEBSITE";

export type MessageDirection = "INBOUND" | "OUTBOUND";

export type MessageSenderType =
  | "CUSTOMER"
  | "USER"
  | "SYSTEM"
  | "AI"
  | "CAMPAIGN";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "FILE"
  | "LOCATION"
  | "STICKER"
  | "SYSTEM"
  | "INTERNAL_NOTE";

export type MessageStatus =
  | "RECEIVED"
  | "QUEUED"
  | "SENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "INTERNAL";

export type ConversationCustomer = {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
};

export type ConversationIdentity = {
  id: string;
  channel: ConversationChannel;
  external_id: string;
};

export type ConversationAssignedUser = {
  id: string;
  full_name: string;
};

export type Conversation = {
  id: string;
  customer_id: string;
  channel: ConversationChannel;
  customer_identity_id: string | null;
  status: ConversationStatus;
  assigned_user_id: string | null;
  last_message_at: string | null;
  unread_count: number;
  handling_state: HandlingState;
  handover_reason: string | null;
  handover_requested_at: string | null;
  human_started_at: string | null;
  resolved_at: string | null;
  customer: ConversationCustomer;
  identity: ConversationIdentity | null;
  assigned_user: ConversationAssignedUser | null;
  created_at: string;
  updated_at: string;
  last_message?: InboxMessagePreview | null;
};

export type InboxMessagePreview = {
  content: string | null;
  created_at: string;
  sender_type: MessageSenderType;
  direction: MessageDirection;
  status?: MessageStatus;
};

export type Message = {
  id: string;
  direction: MessageDirection;
  sender_type: MessageSenderType;
  message_type: MessageType;
  content: string | null;
  external_id: string | null;
  status: MessageStatus;
  metadata: unknown;
  created_at: string;
  updated_at: string;
};

export type ConversationFilter =
  | "all"
  | "unread"
  | "ai_active"
  | "human_requested"
  | "human_active"
  | "resolved";

export type ConversationListQuery = {
  status?: ConversationStatus;
  unread?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export type HumanInboxQuery = {
  state?: "HUMAN_REQUESTED" | "HUMAN_ACTIVE" | "RESOLVED";
  limit?: number;
  offset?: number;
};

export type MessageListQuery = {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
};
