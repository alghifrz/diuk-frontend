import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/workspace";
import type { CurrentMe, Workspace } from "@/types/workspace";

export async function getWorkspace(): Promise<Workspace | null> {
  const workspaceId = getWorkspaceId();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!workspaceId || !baseUrl) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Business-ID": workspaceId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { id: workspaceId, name: "", slug: "" };
    }

    const payload = (await response.json()) as CurrentMe;
    return payload.business ?? { id: workspaceId, name: "", slug: "" };
  } catch {
    return { id: workspaceId, name: "", slug: "" };
  }
}
