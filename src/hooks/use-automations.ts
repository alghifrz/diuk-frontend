"use client";

import { useCallback, useState } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import {
  activateAutomation,
  archiveAutomation,
  deactivateAutomation,
  listAutomations,
} from "@/lib/api/automations";
import { toUserMessage } from "@/lib/api/errors";
import { getWorkspaceId } from "@/lib/workspace";
import type { Automation } from "@/types/automation";

const TTL_MS = 60_000;

export function useAutomations() {
  const workspaceId = getWorkspaceId();
  const [busyId, setBusyId] = useState("");

  const { data, loading, error, mutate, refetch } = useCachedResource<
    Automation[]
  >({
    key: workspaceId ? "settings:automations" : null,
    ttlMs: TTL_MS,
    mapError: (err) => toUserMessage(err, "Couldn't load automations."),
    fetcher: listAutomations,
  });

  const [localError, setLocalError] = useState("");

  const setActive = useCallback(
    async (id: string, active: boolean) => {
      setBusyId(id);
      setLocalError("");

      try {
        const next = active
          ? await activateAutomation(id)
          : await deactivateAutomation(id);
        mutate((current) =>
          (current ?? []).map((item) => (item.id === next.id ? next : item)),
        );
      } catch (err) {
        setLocalError(toUserMessage(err, "Couldn't update the automation."));
      } finally {
        setBusyId("");
      }
    },
    [mutate],
  );

  const archive = useCallback(
    async (id: string) => {
      setBusyId(id);
      setLocalError("");

      try {
        const next = await archiveAutomation(id);
        mutate((current) =>
          (current ?? []).map((item) => (item.id === next.id ? next : item)),
        );
      } catch (err) {
        setLocalError(toUserMessage(err, "Couldn't remove the automation."));
      } finally {
        setBusyId("");
      }
    },
    [mutate],
  );

  return {
    items: data ?? [],
    loading: Boolean(workspaceId) && loading,
    error: localError || error,
    busyId,
    setActive,
    archive,
    reload: refetch,
  };
}
