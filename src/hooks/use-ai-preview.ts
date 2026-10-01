"use client";

import { useCallback, useState } from "react";
import { generateAIReply } from "@/lib/api/ai";
import { aiErrorMessage } from "@/lib/ai-errors";
import {
  ensurePreviewConversation,
  resetPreviewConversation,
} from "@/lib/ai-preview-sandbox";

export type PreviewTurn = {
  id: string;
  role: "customer" | "ai";
  text: string;
};

export function useAIPreview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turns, setTurns] = useState<PreviewTurn[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const send = useCallback(async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Enter a customer message to test.");
      return null;
    }

    setLoading(true);
    setError("");

    const customerTurn: PreviewTurn = {
      id: `c-${Date.now()}`,
      role: "customer",
      text: trimmed,
    };
    setTurns((prev) => [...prev, customerTurn]);

    try {
      const conversation = await ensurePreviewConversation();
      setConversationId(conversation.id);

      const next = await generateAIReply({
        conversation_id: conversation.id,
        message: trimmed,
        persist_incoming: true,
      });

      setTurns((prev) => [
        ...prev,
        {
          id: next.message_id || `a-${Date.now()}`,
          role: "ai",
          text: next.reply,
        },
      ]);
      return next;
    } catch (err) {
      setError(aiErrorMessage(err, "Couldn't generate a test reply."));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(async () => {
    const id = conversationId;
    setTurns([]);
    setError("");
    setConversationId(null);
    await resetPreviewConversation(id);
  }, [conversationId]);

  return { loading, error, turns, send, clear };
}
