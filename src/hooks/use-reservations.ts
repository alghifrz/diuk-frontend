"use client";

import { useCallback, useState } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { listReservations } from "@/lib/api/reservations";
import { reservationErrorMessage } from "@/lib/reservation-errors";
import type { ListReservationsParams, Reservation } from "@/types/reservation";

const PAGE_SIZE = 50;
const TTL_MS = 20_000;

type ReservationsPage = {
  items: Reservation[];
  hasMore: boolean;
};

type UseReservationsParams = {
  date: string;
  status?: ListReservationsParams["status"];
  enabled?: boolean;
};

export function useReservations({
  date,
  status,
  enabled = true,
}: UseReservationsParams) {
  const key =
    enabled && date ? `reservations:${date}:${status ?? ""}` : null;

  const { data, loading, error, refetch, mutate } =
    useCachedResource<ReservationsPage>({
      key,
      ttlMs: TTL_MS,
      mapError: (err) =>
        reservationErrorMessage(err, "Couldn't load reservations."),
      fetcher: async () => {
        const rows = await listReservations({
          date,
          status: status || undefined,
          limit: PAGE_SIZE,
          offset: 0,
        });
        return { items: rows, hasMore: rows.length === PAGE_SIZE };
      },
    });

  const [loadingMore, setLoadingMore] = useState(false);
  const items = data?.items ?? [];
  const hasMore = data?.hasMore ?? false;

  const loadMore = useCallback(async () => {
    if (!key || !hasMore || loading || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      const rows = await listReservations({
        date,
        status: status || undefined,
        limit: PAGE_SIZE,
        offset: items.length,
      });
      mutate({
        items: [...items, ...rows],
        hasMore: rows.length === PAGE_SIZE,
      });
    } catch (err) {
      void err;
    } finally {
      setLoadingMore(false);
    }
  }, [date, hasMore, items, key, loading, loadingMore, mutate, status]);

  const upsertItem = useCallback(
    (reservation: Reservation) => {
      mutate((prev) => {
        const base = prev?.items ?? [];
        const index = base.findIndex((item) => item.id === reservation.id);
        let nextItems: Reservation[];
        if (index === -1) {
          nextItems = [reservation, ...base].sort(
            (a, b) =>
              new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
          );
        } else {
          nextItems = [...base];
          nextItems[index] = reservation;
        }
        return {
          items: nextItems,
          hasMore: prev?.hasMore ?? false,
        };
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
