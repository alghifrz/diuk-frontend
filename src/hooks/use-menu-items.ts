"use client";

import { useCallback, useMemo } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { useDebounce } from "@/hooks/use-debounce";
import {
  createMenuItem,
  deactivateMenuItem,
  listAllMenuItems,
  listMenuItems,
  updateMenuItem,
} from "@/lib/api/menu";
import { peekCache, preserveMenuImageUrls } from "@/lib/api-cache";
import { menuErrorMessage } from "@/lib/menu-errors";
import type {
  CreateMenuItemInput,
  MenuItem,
  StatusFilter,
  UpdateMenuItemInput,
} from "@/types/menu";

const TTL_MS = 90_000;

function cacheKey(categoryId: string | null, statusFilter: StatusFilter) {
  return `menu:items:${categoryId ?? "all"}:${statusFilter}`;
}

export function useMenuItems(options: {
  categoryId: string | null;
  statusFilter?: StatusFilter;
  search?: string;
}) {
  const { categoryId, statusFilter = "ACTIVE", search = "" } = options;
  const debouncedSearch = useDebounce(search.trim(), 300);
  const key = cacheKey(categoryId, statusFilter);

  const { data, loading, error, refetch, mutate } = useCachedResource<MenuItem[]>({
    key,
    ttlMs: TTL_MS,
    mapError: (err) => menuErrorMessage(err, "Couldn't load menu items."),
    fetcher: async () => {
      const category = categoryId || undefined;
      const rows =
        statusFilter === "ALL"
          ? await listAllMenuItems(category)
          : await listMenuItems({ status: "ACTIVE", category_id: category });
      const previous = peekCache<MenuItem[]>(key)?.data;
      return preserveMenuImageUrls(previous, rows);
    },
  });

  const items = data ?? [];

  const filtered = useMemo(() => {
    if (!debouncedSearch) {
      return items;
    }
    const q = debouncedSearch.toLowerCase();
    return items.filter((item) => {
      const haystack = [item.name, item.description ?? "", item.category_name]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [debouncedSearch, items]);

  const create = useCallback(
    async (input: CreateMenuItemInput) => {
      const created = await createMenuItem(input);
      mutate((prev) => {
        const base = prev ?? [];
        if (categoryId && created.category_id !== categoryId) {
          return base;
        }
        if (statusFilter === "ACTIVE" && created.status !== "ACTIVE") {
          return base;
        }
        return [...base.filter((item) => item.id !== created.id), created].sort(
          (a, b) =>
            a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
      });
      return created;
    },
    [categoryId, mutate, statusFilter],
  );

  const update = useCallback(
    async (id: string, input: UpdateMenuItemInput) => {
      const updated = await updateMenuItem(id, input);
      mutate((prev) => {
        const base = prev ?? [];
        if (categoryId && updated.category_id !== categoryId) {
          return base.filter((item) => item.id !== id);
        }
        if (statusFilter === "ACTIVE" && updated.status !== "ACTIVE") {
          return base.filter((item) => item.id !== id);
        }
        return base.map((item) => (item.id === id ? updated : item));
      });
      return updated;
    },
    [categoryId, mutate, statusFilter],
  );

  const deactivate = useCallback(
    async (id: string) => {
      const updated = await deactivateMenuItem(id);
      mutate((prev) => {
        const base = prev ?? [];
        if (statusFilter === "ACTIVE") {
          return base.filter((item) => item.id !== id);
        }
        return base.map((item) => (item.id === id ? updated : item));
      });
      return updated;
    },
    [mutate, statusFilter],
  );

  const upsert = useCallback(
    (item: MenuItem) => {
      mutate((prev) => {
        const base = prev ?? [];
        const next = base.some((row) => row.id === item.id)
          ? base.map((row) => (row.id === item.id ? item : row))
          : [...base, item];
        return next.sort(
          (a, b) =>
            a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
      });
    },
    [mutate],
  );

  return {
    items: loading ? [] : filtered,
    allItems: loading ? [] : items,
    loading,
    error,
    refetch,
    create,
    update,
    deactivate,
    upsert,
  };
}
