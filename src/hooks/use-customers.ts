"use client";

import { useCallback, useMemo, useState } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { toUserMessage } from "@/lib/api/errors";
import { listCustomers } from "@/lib/api/customers";
import { isSandboxCustomer } from "@/lib/customer-crm";
import type { Customer, CustomerSort } from "@/types/customer";

const PAGE_SIZE = 50;
const TTL_MS = 15_000;

type CustomersPage = {
  items: Customer[];
  hasMore: boolean;
};

type UseCustomersParams = {
  search: string;
  sort: CustomerSort;
  tagId: string;
  enabled?: boolean;
};

export function useCustomers({
  search,
  sort,
  tagId,
  enabled = true,
}: UseCustomersParams) {
  const key = enabled ? `customers:list:v2:${sort}:${tagId}:${search}` : null;

  const { data, loading, error, refetch, mutate } =
    useCachedResource<CustomersPage>({
      key,
      ttlMs: TTL_MS,
      mapError: (err) => toUserMessage(err, "Couldn't load customers."),
      fetcher: async () => {
        const rows = await listCustomers({
          status: "ACTIVE",
          search: search || undefined,
          tag_id: tagId || undefined,
          sort,
          limit: PAGE_SIZE,
          offset: 0,
        });
        return {
          items: rows.filter((row) => !isSandboxCustomer(row)),
          hasMore: rows.length === PAGE_SIZE,
        };
      },
    });

  const [loadingMore, setLoadingMore] = useState(false);
  const items = useMemo(() => data?.items ?? [], [data]);
  const hasMore = data?.hasMore ?? false;

  const loadMore = useCallback(async () => {
    if (!key || !hasMore || loading || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      const rows = await listCustomers({
        status: "ACTIVE",
        search: search || undefined,
        tag_id: tagId || undefined,
        sort,
        limit: PAGE_SIZE,
        offset: items.length,
      });
      const known = new Set(items.map((item) => item.id));
      mutate({
        items: [
          ...items,
          ...rows.filter(
            (row) => !known.has(row.id) && !isSandboxCustomer(row),
          ),
        ],
        hasMore: rows.length === PAGE_SIZE,
      });
    } catch (err) {
      void err;
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items, key, loading, loadingMore, mutate, search, sort, tagId]);

  const upsertItem = useCallback(
    (customer: Customer) => {
      mutate((prev) => {
        const base = prev?.items ?? [];
        const index = base.findIndex((item) => item.id === customer.id);
        const next = [...base];
        if (index === -1) {
          next.unshift(customer);
        } else {
          // Keep list-only fields (stats) if the detail response lacks them.
          next[index] = { ...base[index], ...customer };
        }
        return { items: next, hasMore: prev?.hasMore ?? false };
      });
    },
    [mutate],
  );

  const removeItem = useCallback(
    (id: string) => {
      mutate((prev) => ({
        items: (prev?.items ?? []).filter((item) => item.id !== id),
        hasMore: prev?.hasMore ?? false,
      }));
    },
    [mutate],
  );

  return {
    items: loading ? [] : items,
    loading,
    loadingMore,
    error,
    hasMore: loading ? false : hasMore,
    loadMore,
    refetch,
    upsertItem,
    removeItem,
  };
}
