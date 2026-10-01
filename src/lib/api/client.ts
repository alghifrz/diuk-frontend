import { createClient } from "@/lib/supabase/client";
import { ApiError } from "@/lib/api/errors";
import { getWorkspaceId } from "@/lib/workspace";

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
}

let cachedToken: { value: string | null; expiresAt: number } | null = null;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;
  // Short TTL — avoids getSession() on every parallel API call without
  // holding an expired JWT for long.
  cachedToken = { value: token, expiresAt: now + 30_000 };
  return token;
}

type RequestOptions = RequestInit & {
  raw?: boolean;
};

export async function apiRequest<T>(path: string, init: RequestOptions = {}) {
  const baseUrl = getApiBaseUrl();
  const workspaceId = getWorkspaceId();
  const token = await getAccessToken();

  if (!baseUrl) {
    throw new ApiError(500, "NO_API_URL", "API URL is not configured.");
  }

  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "authentication required");
  }

  if (!workspaceId) {
    throw new ApiError(400, "NO_WORKSPACE", "workspace is not configured");
  }

  const { raw, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Business-ID", workspaceId);

  const isFormData =
    typeof FormData !== "undefined" && requestInit.body instanceof FormData;

  if (requestInit.body && !headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (isFormData) {
    headers.delete("Content-Type");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...requestInit,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? "REQUEST_FAILED",
      payload?.error?.message ?? "request failed",
    );
  }

  if (!raw && payload && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}
