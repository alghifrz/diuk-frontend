import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseConfig } from "@/lib/supabase/env";

export function createClient() {
  const { url, publishableKey } = requirePublicSupabaseConfig();

  return createBrowserClient(url, publishableKey);
}
