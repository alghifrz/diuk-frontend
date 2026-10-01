import { MessageReceipt } from "@/components/chat/message-receipt";
import { cn } from "@/lib/cn";
import { formatMessageTime } from "@/lib/format-time";
import type { Message } from "@/types/chat";

function senderLabel(message: Message) {
  if (message.message_type === "INTERNAL_NOTE") {
    return "Internal note";
  }

  switch (message.sender_type) {
    case "CUSTOMER":
      return "";
    case "USER":
      return "Agent";
    case "AI":
      return "AI";
    case "SYSTEM":
      return "System";
    case "CAMPAIGN":
      return "Campaign";
    default:
      return message.sender_type;
  }
}

function isCustomerSide(message: Message) {
  if (message.sender_type === "CUSTOMER") {
    return true;
  }

  if (
    message.sender_type === "USER" ||
    message.sender_type === "AI" ||
    message.sender_type === "CAMPAIGN"
  ) {
    return false;
  }

  return message.direction === "INBOUND";
}

type MessageBubbleProps = {
  message: Message;
  stacked?: boolean;
};

export function MessageBubble({ message, stacked = false }: MessageBubbleProps) {
  const isInternal = message.message_type === "INTERNAL_NOTE" || message.status === "INTERNAL";
  const isSystem = message.sender_type === "SYSTEM" || message.message_type === "SYSTEM";
  const isCustomer = isCustomerSide(message);
  const isAI = message.sender_type === "AI";

  if (isInternal) {
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-dashed border-warning/40 bg-warning/10 px-3 py-2">
        <p className="text-[11px] font-semibold tracking-wide text-warning uppercase">
          Internal note
        </p>
        <p className="mt-1 text-sm text-on-surface">{message.content || "—"}</p>
        <p className="mt-1 text-[11px] text-on-surface-variant">
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="inline-flex rounded-full bg-surface px-3 py-1 text-xs text-on-surface-variant">
          {message.content || "System update"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex", isCustomer ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm",
          isCustomer && "rounded-bl-md border border-outline-variant bg-surface text-on-surface",
          !isCustomer && isAI && "rounded-br-md bg-primary/18 text-on-surface",
          !isCustomer && !isAI && "rounded-br-md bg-secondary text-white",
        )}
      >
        {stacked ? null : (
          <p
            className={cn(
              "text-[11px] font-semibold",
              isCustomer || isAI ? "text-on-surface-variant" : "text-white/70",
            )}
          >
            {senderLabel(message)}
          </p>
        )}
        <p className={cn("whitespace-pre-wrap text-sm leading-6", stacked ? "" : "mt-0.5")}>
          {message.content || `[${message.message_type.toLowerCase()}]`}
        </p>
        <p
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[11px]",
            isCustomer || isAI ? "text-on-surface-variant" : "text-white/70",
          )}
        >
          <span>{formatMessageTime(message.created_at)}</span>
          {!isCustomer ? (
            <MessageReceipt message={message} tone={isAI ? "light" : "dark"} />
          ) : null}
        </p>
      </div>
    </div>
  );
}
