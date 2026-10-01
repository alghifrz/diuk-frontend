import { CustomerAvatar } from "@/components/chat/customer-avatar";
import { HandlingBadge } from "@/components/chat/handling-badge";
import { MessageReceipt } from "@/components/chat/message-receipt";
import { UnreadBadge } from "@/components/chat/unread-badge";
import { cn } from "@/lib/cn";
import { customerDisplayName } from "@/lib/chat-display";
import { formatInboxTime } from "@/lib/format-time";
import type { Conversation, MessageStatus } from "@/types/chat";

type ConversationItemProps = {
  conversation: Conversation;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function ConversationItem({
  conversation,
  selected,
  onSelect,
}: ConversationItemProps) {
  const unread = conversation.unread_count > 0;
  const last = conversation.last_message;
  const isOutbound =
    last != null &&
    last.direction === "OUTBOUND" &&
    last.sender_type !== "SYSTEM";
  const preview =
    last && last.sender_type !== "SYSTEM" ? last.content?.trim() : undefined;
  const name = customerDisplayName(conversation);
  const status = (last?.status ?? "SENT") as MessageStatus;

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex w-full gap-3 overflow-visible rounded-xl px-3 py-2.5 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected ? "bg-primary/12" : "hover:bg-background",
      )}
    >
      <CustomerAvatar
        name={name}
        channel={conversation.channel}
        size="sm"
        className="mt-0.5"
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              unread ? "font-semibold text-on-surface" : "font-medium text-on-surface",
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px]",
              unread ? "font-medium text-primary-dark" : "text-on-surface-variant",
            )}
          >
            {formatInboxTime(conversation.last_message_at)}
          </span>
        </span>

        <span className="mt-0.5 flex items-center gap-1.5">
          {isOutbound && preview ? (
            <MessageReceipt
              message={{
                sender_type: last.sender_type,
                message_type: "TEXT",
                direction: last.direction,
                status,
              }}
              tone="light"
              size={14}
            />
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              unread ? "font-medium text-on-surface" : "text-on-surface-variant",
            )}
          >
            {preview || "No messages yet"}
          </span>
          <UnreadBadge count={conversation.unread_count} />
        </span>

        <span className="mt-1.5 block">
          <HandlingBadge state={conversation.handling_state} />
        </span>
      </span>
    </button>
  );
}
