import { apiRequest, toQuery } from "@/lib/api/client";
import type { Message, MessageListQuery } from "@/types/chat";

export function listMessages(conversationId: string, query: MessageListQuery = {}) {
  return apiRequest<Message[]>(
    `/api/v1/conversations/${conversationId}/messages${toQuery({
      limit: query.limit,
      offset: query.offset,
      before: query.before,
      after: query.after,
    })}`,
  );
}

export function replyToConversation(conversationId: string, content: string) {
  return apiRequest<Message>(`/api/v1/conversations/${conversationId}/reply`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function createInternalNote(conversationId: string, content: string) {
  return apiRequest<Message>(`/api/v1/conversations/${conversationId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
