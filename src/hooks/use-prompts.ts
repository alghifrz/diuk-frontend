"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activatePrompt,
  archivePrompt,
  createPrompt,
  listPrompts,
  updatePrompt,
} from "@/lib/api/ai";
import { aiErrorMessage } from "@/lib/ai-errors";
import type {
  AIPrompt,
  CreatePromptInput,
  UpdatePromptInput,
} from "@/types/ai";
import { DEFAULT_PROMPT_NAME } from "@/types/ai";

export function usePrompts(promptName = DEFAULT_PROMPT_NAME) {
  const [items, setItems] = useState<AIPrompt[]>([]);
  const [requestKey, setRequestKey] = useState("");
  const [error, setError] = useState("");

  const loading = requestKey !== promptName;

  useEffect(() => {
    let cancelled = false;
    const key = promptName;
    listPrompts({ name: promptName })
      .then((rows) => {
        if (cancelled) return;
        setItems(
          [...rows].sort(
            (a, b) =>
              b.version - a.version ||
              b.updated_at.localeCompare(a.updated_at),
          ),
        );
        setError("");
        setRequestKey(key);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setItems([]);
        setError(aiErrorMessage(err, "Couldn't load prompts."));
        setRequestKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [promptName]);

  const refetch = useCallback(async () => {
    try {
      const rows = await listPrompts({ name: promptName });
      setItems(
        [...rows].sort(
          (a, b) =>
            b.version - a.version ||
            b.updated_at.localeCompare(a.updated_at),
        ),
      );
      setError("");
      setRequestKey(promptName);
    } catch (err) {
      setError(aiErrorMessage(err, "Couldn't load prompts."));
    }
  }, [promptName]);

  const visible = useMemo(
    () => (loading ? [] : items),
    [items, loading],
  );

  const active = useMemo(
    () => visible.find((item) => item.status === "ACTIVE") ?? null,
    [visible],
  );

  const draft = useMemo(
    () => visible.find((item) => item.status === "DRAFT") ?? null,
    [visible],
  );

  const create = useCallback(async (input: CreatePromptInput) => {
    const created = await createPrompt(input);
    setItems((prev) =>
      [created, ...prev.filter((item) => item.id !== created.id)].sort(
        (a, b) => b.version - a.version,
      ),
    );
    return created;
  }, []);

  const update = useCallback(async (id: string, input: UpdatePromptInput) => {
    const updated = await updatePrompt(id, input);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updated : item)),
    );
    return updated;
  }, []);

  const activate = useCallback(async (id: string) => {
    const activated = await activatePrompt(id);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === activated.id) {
          return activated;
        }
        if (
          item.name === activated.name &&
          item.status === "ACTIVE" &&
          item.id !== activated.id
        ) {
          return { ...item, status: "ARCHIVED" as const };
        }
        return item;
      }),
    );
    return activated;
  }, []);

  const archive = useCallback(async (id: string) => {
    const archived = await archivePrompt(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? archived : item)),
    );
    return archived;
  }, []);

  return {
    items: visible,
    active,
    draft,
    loading,
    error: loading ? "" : error,
    refetch,
    create,
    update,
    activate,
    archive,
  };
}
