"use client";

import { useCallback, useEffect, useState } from "react";
import { getAISettings, updateAISettings } from "@/lib/api/ai";
import { aiErrorMessage } from "@/lib/ai-errors";
import type { AISettings, UpdateAISettingsInput } from "@/types/ai";

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [requestKey, setRequestKey] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loading = requestKey !== "loaded";

  useEffect(() => {
    let cancelled = false;
    getAISettings()
      .then((next) => {
        if (cancelled) return;
        setSettings(next);
        setError("");
        setRequestKey("loaded");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setSettings(null);
        setError(aiErrorMessage(err, "Couldn't load AI settings."));
        setRequestKey("loaded");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      const next = await getAISettings();
      setSettings(next);
      setError("");
      setRequestKey("loaded");
    } catch (err) {
      setError(aiErrorMessage(err, "Couldn't load AI settings."));
    }
  }, []);

  const update = useCallback(async (input: UpdateAISettingsInput) => {
    setSaving(true);
    try {
      const next = await updateAISettings(input);
      setSettings(next);
      setError("");
      return next;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings: loading ? null : settings,
    loading,
    error: loading ? "" : error,
    saving,
    refetch,
    update,
  };
}
