"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listConversations,
  listHumanInbox,
} from "@/lib/api/conversations";
import { toUserMessage } from "@/lib/api/errors";
import { useDebounce } from "@/hooks/use-debounce";
import { peekCache, shallowEqualData, writeCache } from "@/lib/api-cache";
import { subscribeInboxChanged } from "@/lib/inbox-events";
import type { Conversation, ConversationFilter } from "@/types/chat";

const PAGE_SIZE = 50;
const POLL_MS = 2000;
const TTL_MS = 1500;

type ConversationsPage = {
  items: Conversation[];
  hasMore: boolean;
};

function cacheKey(filter: ConversationFilter, search: string) {
  return `chat:conversations:${filter}:${search}`;
}

function matchesSearch(conversation: Conversation, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [
    conversation.customer.name,
    conversation.customer.phone ?? "",
    conversation.customer.email ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

export function useConversations(filter: ConversationFilter, search: string) {
  const debouncedSearch = useDebounce(search.trim(), 300);
  const key = cacheKey(filter, debouncedSearch);
  const cached = peekCache<ConversationsPage>(key);

  const [items, setItems] = useState<Conversation[]>(() => cached?.data.items ?? []);
  const [requestKey, setRequestKey] = useState(() => (cached ? key : ""));
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(() => cached?.data.hasMore ?? false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loading = requestKey !== key;

  const fetchPage = useCallback(
    async (offset: number) => {
      const query = {
        limit: PAGE_SIZE,
        offset,
        search: debouncedSearch || undefined,
      };

      if (filter === "unread") {
        return listConversations({ ...query, unread: true });
      }

      if (filter === "human_requested") {
        const rows = await listHumanInbox({
          state: "HUMAN_REQUESTED",
          limit: PAGE_SIZE,
          offset,
        });
        return rows.filter((row) => matchesSearch(row, debouncedSearch));
      }

      if (filter === "human_active") {
        const rows = await listHumanInbox({
          state: "HUMAN_ACTIVE",
          limit: PAGE_SIZE,
          offset,
        });
        return rows.filter((row) => matchesSearch(row, debouncedSearch));
      }

      if (filter === "resolved") {
        const rows = await listHumanInbox({
          state: "RESOLVED",
          limit: PAGE_SIZE,
          offset,
        });
        return rows.filter((row) => matchesSearch(row, debouncedSearch));
      }

      const rows = await listConversations(query);

      if (filter === "ai_active") {
        return rows.filter((row) => row.handling_state === "AI_ACTIVE");
      }

      return rows;
    },
    [debouncedSearch, filter],
  );

  const applyPage = useCallback(
    (nextKey: string, rows: Conversation[]) => {
      const page: ConversationsPage = {
        items: rows,
        hasMore: rows.length === PAGE_SIZE,
      };
      writeCache(nextKey, page);
      setItems((prev) => (shallowEqualData(prev, rows) ? prev : rows));
      setHasMore(page.hasMore);
      setError("");
      setRequestKey(nextKey);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const existing = peekCache<ConversationsPage>(key);

    if (existing) {
      setItems((prev) =>
        shallowEqualData(prev, existing.data.items) ? prev : existing.data.items,
      );
      setHasMore(existing.data.hasMore);
      setRequestKey(key);
      setError("");

      if (Date.now() - existing.updatedAt < TTL_MS) {
        return;
      }
    }

    (async () => {
      try {
        const rows = await fetchPage(0);
        if (cancelled) {
          return;
        }
        applyPage(key, rows);
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (!existing) {
          setItems([]);
          setHasMore(false);
        }
        setError(toUserMessage(err, "Couldn't load conversations."));
        setRequestKey(key);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyPage, fetchPage, key]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) {
      return;
    }

    setLoadingMore(true);

    try {
      const rows = await fetchPage(items.length);
      setItems((current) => {
        const next = [...current, ...rows];
        writeCache(key, { items: next, hasMore: rows.length === PAGE_SIZE });
        return next;
      });
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError(toUserMessage(err, "Couldn't load conversations."));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, items.length, key, loading, loadingMore]);

  const reload = useCallback(async () => {
    try {
      const rows = await fetchPage(0);
      applyPage(key, rows);
    } catch (err) {
      setError(toUserMessage(err, "Couldn't load conversations."));
    }
  }, [applyPage, fetchPage, key]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void reload();
      }
    }, POLL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void reload();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    const unsubscribe = subscribeInboxChanged(() => {
      void reload();
    });

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribe();
    };
  }, [reload]);

  const updateConversation = useCallback((next: Conversation) => {
    setItems((current) =>
      current.map((item) => (item.id === next.id ? { ...item, ...next } : item)),
    );
  }, []);

  const prependPreview = useCallback(
    (conversationId: string, content: string, createdAt: string) => {
      setItems((current) =>
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                last_message_at: createdAt,
                last_message: {
                  content,
                  created_at: createdAt,
                  sender_type: "USER",
                  direction: "OUTBOUND",
                  status: "QUEUED",
                },
              }
            : item,
        ),
      );
    },
    [],
  );

  return {
    items: loading ? [] : items,
    loading,
    loadingMore,
    error,
    hasMore,
    reload,
    loadMore,
    updateConversation,
    prependPreview,
  };
}
