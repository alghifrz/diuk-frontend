"use client";

import { useCallback } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { toUserMessage } from "@/lib/api/errors";
import { listTags } from "@/lib/api/customers";
import type { CustomerTag } from "@/types/customer";

export function useCustomerTags() {
  const { data, loading, error, refetch, mutate } = useCachedResource<
    CustomerTag[]
  >({
    key: "customers:tags",
    ttlMs: 60_000,
    mapError: (err) => toUserMessage(err, "Couldn't load tags."),
    fetcher: () => listTags("ACTIVE"),
  });

  const addTag = useCallback(
    (tag: CustomerTag) => {
      mutate((prev) => {
        const base = prev ?? [];
        return base.some((item) => item.id === tag.id)
          ? base
          : [...base, tag].sort((a, b) => a.name.localeCompare(b.name));
      });
    },
    [mutate],
  );

  return { tags: data ?? [], loading, error, refetch, addTag };
}
