import { apiRequest } from "@/lib/api/client";
import type { CurrentMe } from "@/types/workspace";

export function getMe() {
  return apiRequest<CurrentMe>("/api/v1/me", { raw: true });
}
