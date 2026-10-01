import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/env";
import type { CurrentUser } from "@/types/user";

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function getVerifiedAuthClaims() {
  if (!getPublicSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return data?.claims ?? null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const claims = await getVerifiedAuthClaims();

  if (!claims) {
    return null;
  }

  const metadata =
    claims.user_metadata && typeof claims.user_metadata === "object"
      ? (claims.user_metadata as Record<string, unknown>)
      : {};

  return {
    email: readString(claims.email),
    name: readString(metadata.full_name) ?? readString(metadata.name),
  };
}
