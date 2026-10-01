import { getWorkspaceId } from "@/lib/workspace";

type CacheEntry<T> = {
  data: T;
  updatedAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function scopedKey(key: string) {
  const workspaceId = getWorkspaceId() ?? "anon";
  return `${workspaceId}:${key}`;
}

export function peekCache<T>(key: string): CacheEntry<T> | undefined {
  return store.get(scopedKey(key)) as CacheEntry<T> | undefined;
}

export function writeCache<T>(key: string, data: T) {
  store.set(scopedKey(key), { data, updatedAt: Date.now() });
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    inflight.clear();
    return;
  }

  const scoped = scopedKey(prefix);
  for (const key of store.keys()) {
    if (key === scoped || key.startsWith(`${scoped}:`) || key.startsWith(scoped)) {
      store.delete(key);
    }
  }
  for (const key of inflight.keys()) {
    if (key === scoped || key.startsWith(`${scoped}:`) || key.startsWith(scoped)) {
      inflight.delete(key);
    }
  }
}

export function isCacheFresh(key: string, ttlMs: number) {
  const entry = peekCache(key);
  if (!entry) {
    return false;
  }
  return Date.now() - entry.updatedAt < ttlMs;
}

export async function readThroughCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttlMs?: number; force?: boolean } = {},
): Promise<T> {
  const { ttlMs = 60_000, force = false } = options;
  const scoped = scopedKey(key);

  if (!force) {
    const existing = peekCache<T>(key);
    if (existing && Date.now() - existing.updatedAt < ttlMs) {
      return existing.data;
    }
  }

  const pending = inflight.get(scoped) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const request = fetcher()
    .then((data) => {
      writeCache(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(scoped);
    });

  inflight.set(scoped, request);
  return request;
}

/** Prefer existing signed image URLs when the underlying path did not change. */
export function preserveMenuImageUrls<
  T extends {
    id: string;
    image_path: string | null;
    image_url: string | null;
    image_thumb_url?: string | null;
  },
>(previous: T[] | undefined, next: T[]): T[] {
  if (!previous?.length) {
    return next;
  }

  const prior = new Map(previous.map((item) => [item.id, item]));
  return next.map((item) => {
    const old = prior.get(item.id);
    if (
      old &&
      old.image_path &&
      old.image_path === item.image_path &&
      old.image_url &&
      item.image_url
    ) {
      return {
        ...item,
        image_url: old.image_url,
        image_thumb_url: old.image_thumb_url ?? item.image_thumb_url,
      };
    }
    return item;
  });
}

export function shallowEqualData(a: unknown, b: unknown) {
  if (a === b) {
    return true;
  }
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
