"use client";

import { useCallback } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import {
  createArea,
  deactivateArea,
  listAllAreas,
  listAreas,
  updateArea,
} from "@/lib/api/areas";
import { areaErrorMessage } from "@/lib/area-errors";
import type {
  Area,
  AreaStatusFilter,
  CreateAreaInput,
  UpdateAreaInput,
} from "@/types/area";

const TTL_MS = 90_000;

export function useAreas(filter: AreaStatusFilter = "ACTIVE") {
  const key = `areas:${filter}`;

  const { data, loading, error, refetch, mutate } = useCachedResource<Area[]>({
    key,
    ttlMs: TTL_MS,
    mapError: (err) => areaErrorMessage(err, "Couldn't load areas."),
    fetcher: () => (filter === "ALL" ? listAllAreas() : listAreas("ACTIVE")),
  });

  const items = data ?? [];

  const create = useCallback(
    async (input: CreateAreaInput) => {
      const created = await createArea(input);
      mutate((prev) => {
        const base = prev ?? [];
        if (base.some((item) => item.id === created.id)) {
          return base.map((item) => (item.id === created.id ? created : item));
        }
        return [...base, created].sort((a, b) => a.name.localeCompare(b.name));
      });
      return created;
    },
    [mutate],
  );

  const update = useCallback(
    async (id: string, input: UpdateAreaInput) => {
      const updated = await updateArea(id, input);
      mutate((prev) =>
        (prev ?? []).map((item) => (item.id === id ? updated : item)),
      );
      return updated;
    },
    [mutate],
  );

  const deactivate = useCallback(
    async (id: string) => {
      const updated = await deactivateArea(id);
      mutate((prev) => {
        const base = prev ?? [];
        if (filter === "ACTIVE") {
          return base.filter((item) => item.id !== id);
        }
        return base.map((item) => (item.id === id ? updated : item));
      });
      return updated;
    },
    [filter, mutate],
  );

  const upsert = useCallback(
    (area: Area) => {
      mutate((prev) => {
        const base = prev ?? [];
        const index = base.findIndex((item) => item.id === area.id);
        if (index === -1) {
          return [...base, area].sort((a, b) => a.name.localeCompare(b.name));
        }
        const next = [...base];
        next[index] = area;
        return next;
      });
    },
    [mutate],
  );

  return {
    items: loading ? [] : items,
    loading,
    error,
    refetch,
    create,
    update,
    deactivate,
    upsert,
  };
}
