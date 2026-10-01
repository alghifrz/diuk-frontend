"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/chat/conversation-list";
import { ConversationThread } from "@/components/chat/conversation-thread";
import { CustomerPanel } from "@/components/chat/customer-panel";
import { useConversation } from "@/hooks/use-conversation";
import { useConversations } from "@/hooks/use-conversations";
import { useCustomerContext } from "@/hooks/use-customer-context";
import { useMessages } from "@/hooks/use-messages";
import {
  markConversationRead,
  requestHandover,
  resolveConversation,
  resumeAI,
  takeoverConversation,
} from "@/lib/api/conversations";
import { notifyInboxChanged } from "@/lib/inbox-events";
import { createInternalNote, replyToConversation } from "@/lib/api/messages";
import { toUserMessage } from "@/lib/api/errors";
import { getWorkspaceId } from "@/lib/workspace";
import { cn } from "@/lib/cn";
import type { ConversationFilter } from "@/types/chat";

export function ChatWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("conversation");
  const workspaceId = getWorkspaceId();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const inbox = useConversations(filter, search);
  const updateConversation = inbox.updateConversation;

  const handleNewInbound = useCallback(() => {
    if (!selectedId) {
      return;
    }

    void markConversationRead(selectedId).then((next) => {
      updateConversation(next);
      notifyInboxChanged();
    });
  }, [selectedId, updateConversation]);

  const messages = useMessages(selectedId, handleNewInbound);
  const thread = useConversation(selectedId, inbox.updateConversation, messages.markCustomerRead);
  const customer = useCustomerContext(thread.conversation?.customer_id ?? null);

  const selectedFromList = useMemo(
    () => inbox.items.find((item) => item.id === selectedId) ?? null,
    [inbox.items, selectedId],
  );
  const conversation = thread.conversation ?? selectedFromList;

  const selectConversation = useCallback(
    (id: string) => {
      const current = inbox.items.find((item) => item.id === id);
      if (current && current.unread_count > 0) {
        inbox.updateConversation({ ...current, unread_count: 0 });
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("conversation", id);
      router.replace(`/chat?${params.toString()}`, { scroll: false });
    },
    [inbox, router, searchParams],
  );

  const clearConversation = useCallback(() => {
    router.replace("/chat", { scroll: false });
    setCustomerOpen(false);
  }, [router]);

  const handleSend = useCallback(
    async (mode: "reply" | "note", content: string) => {
      if (!selectedId) {
        return false;
      }

      setSending(true);
      setSendError("");

      try {
        const message =
          mode === "note"
            ? await createInternalNote(selectedId, content)
            : await replyToConversation(selectedId, content);

        messages.appendMessage(message);
        inbox.prependPreview(selectedId, content, message.created_at);

        if (mode === "reply") {
          await thread.reload();
        }

        return true;
      } catch (err) {
        setSendError(
          mode === "note"
            ? toUserMessage(err, "Note couldn't be saved.")
            : toUserMessage(err, "Message couldn't be sent."),
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [inbox, messages, selectedId, thread],
  );

  const handleHandoverAction = useCallback(
    async (action: "handover" | "takeover" | "resolve" | "resume") => {
      if (!selectedId) {
        return;
      }

      setActionBusy(true);

      try {
        const next =
          action === "handover"
            ? await requestHandover(selectedId)
            : action === "takeover"
              ? await takeoverConversation(selectedId)
              : action === "resolve"
                ? await resolveConversation(selectedId)
                : await resumeAI(selectedId);

        thread.setConversation(next);
        inbox.updateConversation(next);
      } catch (err) {
        setSendError(toUserMessage(err, "Couldn't update conversation handling."));
      } finally {
        setActionBusy(false);
      }
    },
    [inbox, selectedId, thread],
  );

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div>
          <p className="text-base font-semibold text-on-surface">Workspace is not configured</p>
          <p className="mt-2 max-w-md text-sm text-on-surface-variant">
            Set NEXT_PUBLIC_BUSINESS_ID to the business UUID for the signed-in user.
            The API requires X-Business-ID and this app does not invent a tenant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden border-y border-outline-variant bg-surface lg:mx-3 lg:mb-3 lg:rounded-2xl lg:border">
      <div
        className={cn(
          "h-full w-full shrink-0 md:w-[320px]",
          selectedId ? "hidden md:flex" : "flex",
        )}
      >
        <ConversationList
          items={inbox.items}
          selectedId={selectedId}
          search={search}
          filter={filter}
          loading={inbox.loading}
          loadingMore={inbox.loadingMore}
          hasMore={inbox.hasMore}
          error={inbox.error}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSelect={selectConversation}
          onLoadMore={() => void inbox.loadMore()}
          onRetry={() => void inbox.reload()}
        />
      </div>

      <div className={cn("min-w-0 flex-1", !selectedId && "hidden md:flex")}>
        <ConversationThread
          conversation={conversation}
          messages={messages.messages}
          loading={thread.loading || messages.loading}
          messagesError={messages.error}
          conversationError={thread.error}
          sending={sending}
          sendError={sendError}
          hasNewer={messages.hasNewer}
          loadingMore={messages.loadingMore}
          showBack
          onBack={clearConversation}
          onOpenCustomer={() => setCustomerOpen(true)}
          onSend={handleSend}
          onHandoverAction={handleHandoverAction}
          actionBusy={actionBusy}
          onLoadNewer={() => void messages.loadNewer()}
        />
      </div>

      <div className="hidden h-full xl:flex">
        <CustomerPanel
          conversation={conversation}
          customer={customer.customer}
          reservations={customer.reservations}
          loading={customer.loading}
          error={customer.error}
        />
      </div>

      {customerOpen && conversation ? (
        <div className="xl:hidden">
          <div
            className="fixed inset-0 z-40 bg-on-surface/40"
            onClick={() => setCustomerOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-outline-variant shadow-sm">
            <CustomerPanel
              conversation={conversation}
              customer={customer.customer}
              reservations={customer.reservations}
              loading={customer.loading}
              error={customer.error}
              onClose={() => setCustomerOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
