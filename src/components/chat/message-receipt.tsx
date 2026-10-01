import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { Message, MessageStatus } from "@/types/chat";

type ReceiptTone = "light" | "dark";

export function receiptMeta(status: MessageStatus) {
  switch (status) {
    case "QUEUED":
    case "SENDING":
      return { icon: "schedule", label: "Sending", checked: false, read: false };
    case "SENT":
      return { icon: "done", label: "Sent", checked: true, read: false };
    case "DELIVERED":
      return { icon: "done_all", label: "Delivered", checked: true, read: false };
    case "READ":
      return { icon: "done_all", label: "Read", checked: true, read: true };
    case "FAILED":
      return { icon: "error", label: "Failed", checked: false, read: false };
    case "RECEIVED":
      return null;
    default:
      return null;
  }
}

export function shouldShowReceipt(
  message: Pick<Message, "sender_type" | "message_type" | "direction" | "status">,
) {
  if (message.message_type === "INTERNAL_NOTE" || message.status === "INTERNAL") {
    return false;
  }

  if (message.sender_type === "SYSTEM" || message.message_type === "SYSTEM") {
    return false;
  }

  if (message.sender_type === "CUSTOMER" || message.direction === "INBOUND") {
    return message.status === "READ";
  }

  return true;
}

type MessageReceiptProps = {
  message: Pick<Message, "sender_type" | "message_type" | "direction" | "status">;
  tone: ReceiptTone;
  size?: number;
};

export function MessageReceipt({ message, tone, size = 14 }: MessageReceiptProps) {
  if (!shouldShowReceipt(message)) {
    return null;
  }

  const meta = receiptMeta(message.status);
  if (!meta) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 translate-y-px items-center",
        meta.read
          ? "text-[#53bdeb]"
          : message.status === "FAILED"
            ? "text-error"
            : tone === "dark"
              ? "text-white/70"
              : "text-on-surface-variant",
      )}
      aria-label={meta.label}
      title={meta.label}
    >
      <Icon name={meta.icon} size={size} filled={meta.read} />
    </span>
  );
}
