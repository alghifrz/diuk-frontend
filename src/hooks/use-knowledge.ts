"use client";

import { useEffect } from "react";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { getKnowledgeStatus, listKnowledge } from "@/lib/api/knowledge";
import { knowledgeErrorMessage } from "@/lib/knowledge-errors";
import { getWorkspaceId } from "@/lib/workspace";
import type { KnowledgeDocument, KnowledgeStatus } from "@/types/knowledge";

const POLL_MS = 3_000;

export function isDocumentBusy(doc: KnowledgeDocument) {
  return doc.status === "PENDING" || doc.status === "PROCESSING";
}

/** Document list that keeps itself fresh while anything is still ingesting. */
export function useKnowledgeDocuments() {
  const workspaceId = getWorkspaceId();
  const resource = useCachedResource<KnowledgeDocument[]>({
    key: workspaceId ? `knowledge:docs:${workspaceId}` : null,
    ttlMs: 15_000,
    mapError: (err) =>
      knowledgeErrorMessage(err, "Couldn't load your knowledge documents."),
    fetcher: () => listKnowledge(),
  });

  const { refetch } = resource;
  const busy = (resource.data ?? []).some(isDocumentBusy);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => void refetch(), POLL_MS);
    return () => clearInterval(timer);
  }, [busy, refetch]);

  return resource;
}

export function useKnowledgeStatus() {
  const workspaceId = getWorkspaceId();
  return useCachedResource<KnowledgeStatus>({
    key: workspaceId ? `knowledge:status:${workspaceId}` : null,
    ttlMs: 60_000,
    mapError: (err) =>
      knowledgeErrorMessage(err, "Couldn't check knowledge settings."),
    fetcher: () => getKnowledgeStatus(),
  });
}
