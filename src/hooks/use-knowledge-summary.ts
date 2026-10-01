"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listKnowledgeDocuments } from "@/lib/api/ai";
import { aiErrorMessage } from "@/lib/ai-errors";
import type { KnowledgeDocument, KnowledgeSummary } from "@/types/ai";

export function useKnowledgeSummary() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [requestKey, setRequestKey] = useState("");
  const [error, setError] = useState("");

  const loading = requestKey !== "loaded";

  useEffect(() => {
    let cancelled = false;
    listKnowledgeDocuments()
      .then((rows) => {
        if (cancelled) return;
        setDocuments(rows);
        setError("");
        setRequestKey("loaded");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDocuments([]);
        setError(aiErrorMessage(err, "Couldn't load knowledge documents."));
        setRequestKey("loaded");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      const rows = await listKnowledgeDocuments();
      setDocuments(rows);
      setError("");
      setRequestKey("loaded");
    } catch (err) {
      setError(aiErrorMessage(err, "Couldn't load knowledge documents."));
    }
  }, []);

  const visible = useMemo(
    () => (loading ? [] : documents),
    [documents, loading],
  );

  const summary = useMemo<KnowledgeSummary>(() => {
    const counts = {
      total: visible.length,
      ready: 0,
      processing: 0,
      pending: 0,
      failed: 0,
      archived: 0,
    };
    for (const doc of visible) {
      if (doc.status === "READY") counts.ready += 1;
      else if (doc.status === "PROCESSING") counts.processing += 1;
      else if (doc.status === "PENDING") counts.pending += 1;
      else if (doc.status === "FAILED") counts.failed += 1;
      else if (doc.status === "ARCHIVED") counts.archived += 1;
    }
    return { ...counts, documents: visible };
  }, [visible]);

  return {
    summary,
    documents: visible,
    loading,
    error: loading ? "" : error,
    refetch,
  };
}
