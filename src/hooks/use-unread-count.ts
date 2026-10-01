"use client";

import { useCallback, useEffect, useState } from "react";
import { listConversations } from "@/lib/api/conversations";
import { peekCache, writeCache } from "@/lib/api-cache";
import { subscribeInboxChanged } from "@/lib/inbox-events";
import { getWorkspaceId } from "@/lib/workspace";

const PAGE_SIZE = 100;
const POLL_MS = 3000;
const CACHE_KEY = "chat:unread-count";
const FRESH_MS = 2000;

export function useUnreadCount() {
  const workspaceId = getWorkspaceId();
  const [count, setCount] = useState(() => peekCache<number>(CACHE_KEY)?.data ?? 0);

  const reload = useCallback(async () => {
    if (!workspaceId) {
      setCount(0);
      return;
    }

    try {
      const rows = await listConversations({ unread: true, limit: PAGE_SIZE });
      const total = rows.reduce((sum, item) => sum + item.unread_count, 0);
      const next =
        rows.length === PAGE_SIZE && total > 0 ? Math.max(total, 100) : total;
      writeCache(CACHE_KEY, next);
      setCount((prev) => (prev === next ? prev : next));
    } catch {
      // Keep the last known count; the chat list shows its own error.
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const cached = peekCache<number>(CACHE_KEY);
    if (cached && Date.now() - cached.updatedAt < FRESH_MS) {
      setCount(cached.data);
    } else {
      void reload();
    }

    const unsubscribe = subscribeInboxChanged(() => {
      void reload();
    });

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

    return () => {
      unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reload, workspaceId]);

  return workspaceId ? count : 0;
}
