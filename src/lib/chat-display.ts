import type { Conversation, ConversationChannel, Message } from "@/types/chat";

export const CHANNEL_LABEL: Record<ConversationChannel, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  WEBSITE: "Website",
};

export const CHANNEL_ICON: Record<ConversationChannel, string> = {
  WHATSAPP: "chat",
  INSTAGRAM: "photo_camera",
  WEBSITE: "language",
};

export function customerDisplayName(conversation: Conversation) {
  return conversation.customer.name?.trim() || conversation.customer.phone || "Customer";
}

export function customerInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export function isOperatorVisibleMessage(message: Pick<Message, "sender_type" | "message_type">) {
  return message.sender_type !== "SYSTEM" && message.message_type !== "SYSTEM";
}

export function messageDayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
