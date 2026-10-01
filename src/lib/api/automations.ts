import { apiRequest } from "@/lib/api/client";
import type { Automation } from "@/types/automation";

export function listAutomations() {
  return apiRequest<Automation[]>("/api/v1/automations");
}

export function deactivateAutomation(id: string) {
  return apiRequest<Automation>(`/api/v1/automations/${id}/deactivate`, {
    method: "POST",
  });
}

export function activateAutomation(id: string) {
  return apiRequest<Automation>(`/api/v1/automations/${id}/activate`, {
    method: "POST",
  });
}

export function archiveAutomation(id: string) {
  return apiRequest<Automation>(`/api/v1/automations/${id}`, {
    method: "DELETE",
  });
}
