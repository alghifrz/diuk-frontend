"use client";

import { useEffect, useState } from "react";
import { getMenuItem } from "@/lib/api/menu";
import { menuErrorMessage } from "@/lib/menu-errors";
import type { MenuItem } from "@/types/menu";

/** Fetch a single menu item (refreshes signed image URL when needed). */
export function useMenuItem(id: string | null) {
  const [item, setItem] = useState<MenuItem | null>(null);
  const [requestKey, setRequestKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loading = Boolean(id) && requestKey !== id;

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    getMenuItem(id)
      .then((row) => {
        if (cancelled) {
          return;
        }
        setItem(row);
        setError("");
        setRequestKey(id);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setItem(null);
        setError(menuErrorMessage(err, "Couldn't load menu item."));
        setRequestKey(id);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return { item: null, loading: false, error: "" };
  }

  return {
    item: loading ? null : item,
    loading,
    error: loading ? "" : error,
  };
}
