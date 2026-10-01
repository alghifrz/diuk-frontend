import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  AIPrompt,
  AISettings,
  CreatePromptInput,
  GenerateReplyInput,
  GenerateReplyResult,
  KnowledgeDocument,
  UpdateAISettingsInput,
  UpdatePromptInput,
} from "@/types/ai";

export function getAISettings() {
  return apiRequest<AISettings>("/api/v1/ai/settings");
}

export function updateAISettings(input: UpdateAISettingsInput) {
  return apiRequest<AISettings>("/api/v1/ai/settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listPrompts(params: { name?: string; status?: string } = {}) {
  return apiRequest<AIPrompt[]>(
    `/api/v1/ai/prompts${toQuery({
      name: params.name,
      status: params.status,
    })}`,
  );
}

export function getPrompt(id: string) {
  return apiRequest<AIPrompt>(`/api/v1/ai/prompts/${id}`);
}

export function createPrompt(input: CreatePromptInput) {
  return apiRequest<AIPrompt>("/api/v1/ai/prompts", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? null,
      system_prompt: input.system_prompt,
    }),
  });
}

export function updatePrompt(id: string, input: UpdatePromptInput) {
  return apiRequest<AIPrompt>(`/api/v1/ai/prompts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function activatePrompt(id: string) {
  return apiRequest<AIPrompt>(`/api/v1/ai/prompts/${id}/activate`, {
    method: "POST",
  });
}

export function archivePrompt(id: string) {
  return apiRequest<AIPrompt>(`/api/v1/ai/prompts/${id}`, {
    method: "DELETE",
  });
}

export function generateAIReply(input: GenerateReplyInput) {
  return apiRequest<GenerateReplyResult>("/api/v1/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      conversation_id: input.conversation_id,
      message: input.message,
      persist_incoming: input.persist_incoming ?? true,
    }),
  });
}

export function listKnowledgeDocuments(status?: string) {
  return apiRequest<KnowledgeDocument[]>(
    `/api/v1/knowledge/documents${toQuery({ status: status || undefined })}`,
  );
}
