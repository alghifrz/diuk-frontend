import { CustomerAvatar } from "@/components/chat/customer-avatar";
import { HandlingBadge } from "@/components/chat/handling-badge";
import { HandoverActions } from "@/components/chat/handover-actions";
import { Icon } from "@/components/ui/icon";
import { customerDisplayName } from "@/lib/chat-display";
import type { Conversation } from "@/types/chat";

type ConversationHeaderProps = {
  conversation: Conversation;
  showBack?: boolean;
  onBack?: () => void;
  onOpenCustomer?: () => void;
  busy?: boolean;
  onAction: (action: "handover" | "takeover" | "resolve" | "resume") => Promise<void>;
};

export function ConversationHeader({
  conversation,
  showBack,
  onBack,
  onOpenCustomer,
  busy,
  onAction,
}: ConversationHeaderProps) {
  const name = customerDisplayName(conversation);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="inline-flex size-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-background md:hidden"
          >
            <Icon name="arrow_back" size={20} />
          </button>
        ) : null}

        <CustomerAvatar
          name={name}
          channel={conversation.channel}
          size="md"
          className="hidden sm:block"
        />

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-on-surface">{name}</h2>
          <div className="mt-1">
            <HandlingBadge state={conversation.handling_state} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <HandoverActions
          state={conversation.handling_state}
          busy={busy}
          onAction={onAction}
        />
        {onOpenCustomer ? (
          <button
            type="button"
            onClick={onOpenCustomer}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-secondary hover:bg-background xl:hidden"
          >
            <Icon name="person" size={16} />
            Customer
          </button>
        ) : null}
      </div>
    </header>
  );
}
