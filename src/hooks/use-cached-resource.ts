"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isCacheFresh,
  peekCache,
  readThroughCache,
  shallowEqualData,
  writeCache,
} from "@/lib/api-cache";

type UseCachedResourceOptions<T> = {
  key: string | null;
  fetcher: () => Promise<T>;
  /** Skip network entirely while data is younger than this. Default 60s. */
  ttlMs?: number;
  /** Map network errors to a user-facing string. */
  mapError?: (err: unknown) => string;
};

export function useCachedResource<T>({
  key,
  fetcher,
  ttlMs = 60_000,
  mapError = () => "Couldn't load data.",
}: UseCachedResourceOptions<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const mapErrorRef = useRef(mapError);
  mapErrorRef.current = mapError;

  const initial = key ? peekCache<T>(key) : undefined;
  const [data, setData] = useState<T | undefined>(() => initial?.data);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(() => (initial && key ? key : ""));

  // Sync from cache immediately when the key changes (avoids skeleton flash).
  if (key && key !== requestKey) {
    const cached = peekCache<T>(key);
    if (cached) {
      setData(cached.data);
      setRequestKey(key);
      setError("");
    }
  } else if (!key && requestKey) {
    setData(undefined);
    setRequestKey("");
    setError("");
  }

  const applyData = useCallback((nextKey: string, next: T) => {
    setData((prev) => {
      if (shallowEqualData(prev, next)) {
        return prev;
      }
      return next;
    });
    writeCache(nextKey, next);
    setError("");
    setRequestKey(nextKey);
  }, []);

  useEffect(() => {
    if (!key) {
      return;
    }

    let cancelled = false;
    const cached = peekCache<T>(key);

    if (cached && isCacheFresh(key, ttlMs)) {
      if (!shallowEqualData(data, cached.data)) {
        setData(cached.data);
      }
      setRequestKey(key);
      setError("");
      return;
    }

    readThroughCache(key, () => fetcherRef.current(), { ttlMs })
      .then((rows) => {
        if (cancelled) {
          return;
        }
        applyData(key, rows);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (!cached) {
          setData(undefined);
        }
        setError(mapErrorRef.current(err));
        setRequestKey(key);
      });

    return () => {
      cancelled = true;
    };
    // intentionally omit `data` — only react to key/ttl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyData, key, ttlMs]);

  const refetch = useCallback(async () => {
    if (!key) {
      return;
    }

    try {
      const rows = await readThroughCache(key, () => fetcherRef.current(), {
        force: true,
      });
      applyData(key, rows);
    } catch (err) {
      setError(mapErrorRef.current(err));
    }
  }, [applyData, key]);

  const mutate = useCallback(
    (updater: T | ((prev: T | undefined) => T)) => {
      if (!key) {
        return;
      }
      setData((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: T | undefined) => T)(prev)
            : updater;
        writeCache(key, next);
        setRequestKey(key);
        setError("");
        return next;
      });
    },
    [key],
  );

  const loading = Boolean(key) && requestKey !== key;

  return {
    data,
    loading,
    error: loading ? "" : error,
    refetch,
    mutate,
  };
}
