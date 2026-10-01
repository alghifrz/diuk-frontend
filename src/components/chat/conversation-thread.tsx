import { useEffect, useRef } from "react";
import { ConversationHeader } from "@/components/chat/conversation-header";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageComposer } from "@/components/chat/message-composer";
import { Icon } from "@/components/ui/icon";
import { messageDayKey } from "@/lib/chat-display";
import { formatMessageDay } from "@/lib/format-time";
import type { Conversation, Message } from "@/types/chat";

type ConversationThreadProps = {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  messagesError: string;
  conversationError: string;
  sending: boolean;
  sendError: string;
  hasNewer: boolean;
  loadingMore: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onOpenCustomer?: () => void;
  onSend: (mode: "reply" | "note", content: string) => Promise<boolean>;
  onHandoverAction: (action: "handover" | "takeover" | "resolve" | "resume") => Promise<void>;
  actionBusy?: boolean;
  onLoadNewer: () => void;
};

function isSameStack(current: Message, previous?: Message) {
  if (!previous) {
    return false;
  }

  if (previous.sender_type !== current.sender_type) {
    return false;
  }

  if (previous.message_type !== current.message_type) {
    return false;
  }

  if (previous.direction !== current.direction) {
    return false;
  }

  return messageDayKey(previous.created_at) === messageDayKey(current.created_at);
}

export function ConversationThread({
  conversation,
  messages,
  loading,
  messagesError,
  conversationError,
  sending,
  sendError,
  hasNewer,
  loadingMore,
  showBack,
  onBack,
  onOpenCustomer,
  onSend,
  onHandoverAction,
  actionBusy,
  onLoadNewer,
}: ConversationThreadProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages[messages.length - 1]?.id ?? "";

  useEffect(() => {
    if (loading || !conversation?.id) {
      return;
    }

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        const scroller = scrollerRef.current;
        if (scroller) {
          scroller.scrollTop = scroller.scrollHeight;
          return;
        }
        endRef.current?.scrollIntoView({ block: "end" });
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [conversation?.id, lastMessageId, loading, messages.length]);

  if (!conversation && !loading) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-background px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-on-surface-variant shadow-sm">
          <Icon name="forum" size={28} />
        </span>
        <p className="mt-4 text-base font-semibold text-on-surface">Select a conversation</p>
        <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
          Choose a conversation from the inbox to view the message history.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-background">
      {conversation ? (
        <ConversationHeader
          conversation={conversation}
          showBack={showBack}
          onBack={onBack}
          onOpenCustomer={onOpenCustomer}
          busy={actionBusy}
          onAction={onHandoverAction}
        />
      ) : (
        <div className="h-[68px] animate-pulse border-b border-outline-variant bg-surface" />
      )}

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto w-full max-w-3xl">
          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading messages">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-16 w-2/3 animate-pulse rounded-2xl bg-surface ${
                    index % 2 === 0 ? "" : "ml-auto"
                  }`}
                />
              ))}
            </div>
          ) : conversationError || messagesError ? (
            <p className="text-sm text-error">{conversationError || messagesError}</p>
          ) : (
            <div>
              {messages.map((message, index) => {
                const previous = messages[index - 1];
                const showDay =
                  !previous || messageDayKey(previous.created_at) !== messageDayKey(message.created_at);
                const stacked = isSameStack(message, previous);

                return (
                  <div key={message.id} className={stacked ? "mt-1" : "mt-3"}>
                    {showDay ? (
                      <div className="mb-3 flex items-center gap-3">
                        <span className="h-px flex-1 bg-outline-variant" />
                        <span className="text-[11px] font-medium text-on-surface-variant">
                          {formatMessageDay(message.created_at)}
                        </span>
                        <span className="h-px flex-1 bg-outline-variant" />
                      </div>
                    ) : null}
                    <MessageBubble message={message} stacked={stacked} />
                  </div>
                );
              })}
              {hasNewer ? (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={onLoadNewer}
                    disabled={loadingMore}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-secondary hover:bg-surface disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Load newer messages"}
                  </button>
                </div>
              ) : null}
              <div ref={endRef} aria-hidden />
            </div>
          )}
        </div>
      </div>

      {conversation ? (
        <MessageComposer
          handlingState={conversation.handling_state}
          sending={sending}
          error={sendError}
          onSend={onSend}
        />
      ) : null}
    </section>
  );
}
