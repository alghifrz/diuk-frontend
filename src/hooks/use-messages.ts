"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listMessages } from "@/lib/api/messages";
import { toUserMessage } from "@/lib/api/errors";
import { isOperatorVisibleMessage } from "@/lib/chat-display";
import type { Message } from "@/types/chat";

const PAGE_SIZE = 50;
const MAX_AUTO_PAGES = 4;
const POLL_MS = 1500;
// Messages are ordered oldest-first, so polling offset 0 never sees new messages
// once a thread has more than one page. Poll "after the newest loaded message"
// instead, with a small overlap so late status changes (QUEUED -> SENT) refresh.
const POLL_OVERLAP_MS = 60_000;
const POLL_PAGE_SIZE = 100;
const MAX_POLL_PAGES = 5;

function markCustomerMessagesRead(messages: Message[]) {
  return messages.map((message) =>
    message.sender_type === "CUSTOMER" &&
    message.direction === "INBOUND" &&
    message.status === "RECEIVED"
      ? { ...message, status: "READ" as const }
      : message,
  );
}

function mergeMessagePage(current: Message[], page: Message[]) {
  const incoming = new Map(page.map((item) => [item.id, item]));
  const known = new Set(current.map((item) => item.id));
  const next = current.map((item) => incoming.get(item.id) ?? item);
  const added = page.filter((item) => !known.has(item.id));
  const newInbound = added.some((item) => item.sender_type === "CUSTOMER");

  return {
    messages: [...next, ...added].sort((left, right) => {
      const byTime = left.created_at.localeCompare(right.created_at);
      return byTime !== 0 ? byTime : left.id.localeCompare(right.id);
    }),
    newInbound,
  };
}

export function useMessages(
  conversationId: string | null,
  onNewInbound?: () => void,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [hasNewer, setHasNewer] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const newestRef = useRef<string | null>(null);
  const onNewInboundRef = useRef(onNewInbound);

  useEffect(() => {
    onNewInboundRef.current = onNewInbound;
  }, [onNewInbound]);

  const trackNewest = useCallback((items: Message[]) => {
    for (const item of items) {
      if (!newestRef.current || item.created_at > newestRef.current) {
        newestRef.current = item.created_at;
      }
    }
  }, []);

  const markCustomerRead = useCallback(() => {
    setMessages((current) => markCustomerMessagesRead(current));
  }, []);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let cancelled = false;
    newestRef.current = null;

    (async () => {
      try {
        const collected: Message[] = [];
        let offset = 0;
        let page: Message[] = [];

        for (let i = 0; i < MAX_AUTO_PAGES; i += 1) {
          page = await listMessages(conversationId, { limit: PAGE_SIZE, offset });
          collected.push(...page);
          offset += page.length;

          if (page.length < PAGE_SIZE) {
            break;
          }
        }

        if (cancelled) {
          return;
        }

        trackNewest(collected);
        setMessages(markCustomerMessagesRead(collected));
        setNextOffset(offset);
        setHasNewer(page.length === PAGE_SIZE);
        setLoadedFor(conversationId);
        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }
        setMessages([]);
        setHasNewer(false);
        setLoadedFor(conversationId);
        setError(toUserMessage(err, "Couldn't load messages."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, trackNewest]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let running = false;

    async function poll() {
      // Wait for the initial load; without an anchor there is nothing to diff against.
      if (running || document.visibilityState !== "visible" || !newestRef.current) {
        return;
      }

      running = true;

      try {
        const anchor = new Date(
          new Date(newestRef.current).getTime() - POLL_OVERLAP_MS,
        ).toISOString();
        const fetched: Message[] = [];
        let exhausted = false;

        for (let i = 0; i < MAX_POLL_PAGES; i += 1) {
          const page = await listMessages(conversationId as string, {
            limit: POLL_PAGE_SIZE,
            offset: fetched.length,
            after: anchor,
          });
          fetched.push(...page);

          if (page.length < POLL_PAGE_SIZE) {
            exhausted = true;
            break;
          }
        }

        trackNewest(fetched);

        let sawNewInbound = false;
        setMessages((current) => {
          const merged = mergeMessagePage(current, fetched);
          sawNewInbound = merged.newInbound;
          return markCustomerMessagesRead(merged.messages);
        });

        if (exhausted) {
          // Everything after the anchor is now loaded, so nothing newer is pending.
          setHasNewer(false);
        }

        if (sawNewInbound) {
          onNewInboundRef.current?.();
        }
      } catch {
        // Keep the open thread; the next poll retries.
      } finally {
        running = false;
      }
    }

    const interval = window.setInterval(() => void poll(), POLL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void poll();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [conversationId, trackNewest]);

  const loadNewer = useCallback(async () => {
    if (!conversationId || loadingMore || !hasNewer) {
      return;
    }

    setLoadingMore(true);

    try {
      const page = await listMessages(conversationId, {
        limit: PAGE_SIZE,
        offset: nextOffset,
      });
      trackNewest(page);
      setMessages((current) =>
        markCustomerMessagesRead(mergeMessagePage(current, page).messages),
      );
      setNextOffset((current) => current + page.length);
      setHasNewer(page.length === PAGE_SIZE);
    } catch (err) {
      setError(toUserMessage(err, "Couldn't load messages."));
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, hasNewer, loadingMore, nextOffset, trackNewest]);

  const appendMessage = useCallback((message: Message) => {
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message],
    );
  }, []);

  const reload = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    const page = await listMessages(conversationId, { limit: PAGE_SIZE, offset: 0 });
    newestRef.current = null;
    trackNewest(page);
    setMessages(markCustomerMessagesRead(page));
    setNextOffset(page.length);
    setHasNewer(page.length === PAGE_SIZE);
    setLoadedFor(conversationId);
  }, [conversationId, trackNewest]);

  const ready = loadedFor === conversationId;

  return {
    messages: ready ? messages.filter(isOperatorVisibleMessage) : [],
    loading: Boolean(conversationId) && !ready && !error,
    loadingMore,
    error: conversationId ? error : "",
    hasNewer,
    reload,
    loadNewer,
    appendMessage,
    markCustomerRead,
  };
}
