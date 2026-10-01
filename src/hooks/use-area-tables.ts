"use client";

import { useCallback } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import {
  createTable,
  deactivateTable,
  listAllTables,
  listTables,
  updateTable,
} from "@/lib/api/areas";
import { areaErrorMessage } from "@/lib/area-errors";
import type {
  AreaStatusFilter,
  CreateTableInput,
  DiningTable,
  UpdateTableInput,
} from "@/types/area";

const TTL_MS = 90_000;

export function useAreaTables(
  areaId: string | null,
  filter: AreaStatusFilter = "ACTIVE",
) {
  const key = areaId ? `area-tables:${areaId}:${filter}` : null;

  const { data, loading, error, refetch, mutate } =
    useCachedResource<DiningTable[]>({
      key,
      ttlMs: TTL_MS,
      mapError: (err) => areaErrorMessage(err, "Couldn't load tables."),
      fetcher: () => {
        if (!areaId) {
          return Promise.resolve([]);
        }
        return filter === "ALL"
          ? listAllTables(areaId)
          : listTables(areaId, "ACTIVE");
      },
    });

  const items = data ?? [];

  const create = useCallback(
    async (input: CreateTableInput) => {
      if (!areaId) {
        throw new Error("No area selected");
      }
      const created = await createTable(areaId, input);
      mutate((prev) =>
        [...(prev ?? []), created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return created;
    },
    [areaId, mutate],
  );

  const update = useCallback(
    async (tableId: string, input: UpdateTableInput) => {
      if (!areaId) {
        throw new Error("No area selected");
      }
      const updated = await updateTable(areaId, tableId, input);
      mutate((prev) =>
        (prev ?? []).map((item) => (item.id === tableId ? updated : item)),
      );
      return updated;
    },
    [areaId, mutate],
  );

  const deactivate = useCallback(
    async (tableId: string) => {
      if (!areaId) {
        throw new Error("No area selected");
      }
      const updated = await deactivateTable(areaId, tableId);
      mutate((prev) => {
        const base = prev ?? [];
        if (filter === "ACTIVE") {
          return base.filter((item) => item.id !== tableId);
        }
        return base.map((item) => (item.id === tableId ? updated : item));
      });
      return updated;
    },
    [areaId, filter, mutate],
  );

  return {
    items: !areaId || loading ? [] : items,
    loading: Boolean(areaId) && loading,
    error: !areaId || loading ? "" : error,
    refetch,
    create,
    update,
    deactivate,
  };
}
