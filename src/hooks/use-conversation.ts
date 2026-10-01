"use client";

import { useCallback, useEffect, useState } from "react";
import { getConversation, markConversationRead } from "@/lib/api/conversations";
import { toUserMessage } from "@/lib/api/errors";
import { notifyInboxChanged } from "@/lib/inbox-events";
import type { Conversation } from "@/types/chat";

export function useConversation(
  conversationId: string | null,
  onUpdated?: (conversation: Conversation) => void,
  onMarkedRead?: () => void,
) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const current = await markConversationRead(conversationId);

        if (cancelled) {
          return;
        }

        setConversation(current);
        setError("");
        onUpdated?.(current);
        onMarkedRead?.();
        notifyInboxChanged();
      } catch (err) {
        if (cancelled) {
          return;
        }
        setConversation(null);
        setError(toUserMessage(err, "Couldn't load this conversation."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, onMarkedRead, onUpdated]);

  const reload = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    try {
      const item = await getConversation(conversationId);
      setConversation(item);
      setError("");
      onUpdated?.(item);
    } catch (err) {
      setError(toUserMessage(err, "Couldn't load this conversation."));
    }
  }, [conversationId, onUpdated]);

  const visible =
    conversationId && conversation?.id === conversationId ? conversation : null;

  return {
    conversation: visible,
    setConversation,
    loading: Boolean(conversationId) && !visible && !error,
    error: conversationId ? error : "",
    reload,
  };
}
