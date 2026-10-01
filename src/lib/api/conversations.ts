import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  Conversation,
  ConversationListQuery,
  HumanInboxQuery,
} from "@/types/chat";

export function listConversations(query: ConversationListQuery = {}) {
  return apiRequest<Conversation[]>(
    `/api/v1/conversations${toQuery({
      status: query.status,
      unread: query.unread ? "true" : undefined,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    })}`,
  );
}

export function listHumanInbox(query: HumanInboxQuery = {}) {
  return apiRequest<Conversation[]>(
    `/api/v1/conversations/human-inbox${toQuery({
      state: query.state,
      limit: query.limit,
      offset: query.offset,
    })}`,
  );
}

export function getConversation(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}`);
}

export function createConversation(input: {
  customer_id: string;
  channel: string;
  customer_identity_id?: string | null;
}) {
  return apiRequest<Conversation>("/api/v1/conversations", {
    method: "POST",
    body: JSON.stringify({
      customer_id: input.customer_id,
      channel: input.channel,
      customer_identity_id: input.customer_identity_id ?? undefined,
    }),
  });
}

export function updateConversation(
  id: string,
  input: { status?: string; assigned_user_id?: string | null },
) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function markConversationRead(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}/read`, {
    method: "PATCH",
  });
}

export function requestHandover(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}/handover`, {
    method: "POST",
    body: JSON.stringify({ reason: "MANUAL_HANDOFF" }),
  });
}

export function takeoverConversation(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}/takeover`, {
    method: "POST",
  });
}

export function resolveConversation(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}/resolve`, {
    method: "POST",
  });
}

export function resumeAI(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}/resume-ai`, {
    method: "POST",
  });
}
