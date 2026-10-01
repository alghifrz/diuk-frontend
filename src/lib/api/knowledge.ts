import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  KnowledgeAnswer,
  KnowledgeDocument,
  KnowledgeSearchResult,
  KnowledgeSourceType,
  KnowledgeStatus,
} from "@/types/knowledge";

export function getKnowledgeStatus() {
  return apiRequest<KnowledgeStatus>("/api/v1/knowledge/status");
}

export function listKnowledge(status?: string) {
  return apiRequest<KnowledgeDocument[]>(
    `/api/v1/knowledge/documents${toQuery({ status })}`,
  );
}

type CreateBase = { title: string; description?: string };

export function createKnowledgeText(input: CreateBase & { content: string }) {
  return apiRequest<KnowledgeDocument>("/api/v1/knowledge/documents", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      description: input.description || null,
      content: input.content,
      source_type: "TEXT" satisfies KnowledgeSourceType,
    }),
  });
}

export function uploadKnowledgeFile(
  input: CreateBase & { file: File; sourceType: KnowledgeSourceType },
) {
  const form = new FormData();
  form.set("title", input.title);
  if (input.description) {
    form.set("description", input.description);
  }
  form.set("source_type", input.sourceType);
  form.set("file", input.file);
  return apiRequest<KnowledgeDocument>("/api/v1/knowledge/documents", {
    method: "POST",
    body: form,
  });
}

export function updateKnowledge(
  id: string,
  input: { title: string; description: string },
) {
  return apiRequest<KnowledgeDocument>(`/api/v1/knowledge/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteKnowledge(id: string) {
  return apiRequest<{ id: string }>(`/api/v1/knowledge/documents/${id}`, {
    method: "DELETE",
  });
}

export function reprocessKnowledge(id: string) {
  return apiRequest<KnowledgeDocument>(
    `/api/v1/knowledge/documents/${id}/reprocess`,
    { method: "POST" },
  );
}

export function searchKnowledge(query: string, limit?: number) {
  return apiRequest<KnowledgeSearchResult>("/api/v1/knowledge/search", {
    method: "POST",
    body: JSON.stringify({ query, limit }),
  });
}

export function askKnowledge(question: string) {
  return apiRequest<KnowledgeAnswer>("/api/v1/knowledge/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}
