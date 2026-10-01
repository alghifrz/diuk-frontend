"use client";

import { useCallback } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import {
  createMenuCategory,
  deactivateMenuCategory,
  listAllMenuCategories,
  listMenuCategories,
  updateMenuCategory,
} from "@/lib/api/menu";
import { menuErrorMessage } from "@/lib/menu-errors";
import type {
  CreateCategoryInput,
  MenuCategory,
  StatusFilter,
  UpdateCategoryInput,
} from "@/types/menu";

const TTL_MS = 90_000;

export function useMenuCategories(filter: StatusFilter = "ACTIVE") {
  const key = `menu:categories:${filter}`;

  const { data, loading, error, refetch, mutate } =
    useCachedResource<MenuCategory[]>({
      key,
      ttlMs: TTL_MS,
      mapError: (err) => menuErrorMessage(err, "Couldn't load categories."),
      fetcher: () =>
        filter === "ALL"
          ? listAllMenuCategories()
          : listMenuCategories("ACTIVE"),
    });

  const items = data ?? [];

  const create = useCallback(
    async (input: CreateCategoryInput) => {
      const created = await createMenuCategory(input);
      mutate((prev) =>
        [...(prev ?? []).filter((item) => item.id !== created.id), created].sort(
          (a, b) =>
            a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        ),
      );
      return created;
    },
    [mutate],
  );

  const update = useCallback(
    async (id: string, input: UpdateCategoryInput) => {
      const updated = await updateMenuCategory(id, input);
      mutate((prev) =>
        (prev ?? []).map((item) => (item.id === id ? updated : item)),
      );
      return updated;
    },
    [mutate],
  );

  const deactivate = useCallback(
    async (id: string) => {
      const updated = await deactivateMenuCategory(id);
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
    (category: MenuCategory) => {
      mutate((prev) => {
        const base = prev ?? [];
        const next = base.some((item) => item.id === category.id)
          ? base.map((item) => (item.id === category.id ? category : item))
          : [...base, category];
        return next.sort(
          (a, b) =>
            a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
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
