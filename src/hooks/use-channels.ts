"use client";

import { useCallback } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { listChannels } from "@/lib/api/channels";
import { toUserMessage } from "@/lib/api/errors";
import { getWorkspaceId } from "@/lib/workspace";
import type { BusinessChannel } from "@/types/channel";

const TTL_MS = 60_000;

export function useChannels() {
  const workspaceId = getWorkspaceId();

  const { data, loading, error, refetch, mutate } = useCachedResource<
    BusinessChannel[]
  >({
    key: workspaceId ? "settings:channels" : null,
    ttlMs: TTL_MS,
    mapError: (err) =>
      toUserMessage(err, "Couldn't load channel settings."),
    fetcher: listChannels,
  });

  const setChannels = useCallback(
    (next: BusinessChannel[] | ((prev: BusinessChannel[]) => BusinessChannel[])) => {
      mutate((prev) => {
        const base = prev ?? [];
        return typeof next === "function" ? next(base) : next;
      });
    },
    [mutate],
  );

  return {
    workspaceId,
    channels: data ?? [],
    loading: Boolean(workspaceId) && loading,
    error,
    reload: refetch,
    setChannels,
  };
}
