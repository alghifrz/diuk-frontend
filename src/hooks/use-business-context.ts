"use client";

import { useCachedResource } from "@/hooks/use-cached-resource";
import { getBusinessProfile, getFnbSettings } from "@/lib/api/business";
import { toUserMessage } from "@/lib/api/errors";
import type { BusinessProfile, FnbSettings } from "@/types/reservation";

const TTL_MS = 120_000;

type BusinessContextData = {
  profile: BusinessProfile;
  fnb: FnbSettings;
};

export function useBusinessContext() {
  const { data, loading, error } = useCachedResource<BusinessContextData>({
    key: "business:context",
    ttlMs: TTL_MS,
    mapError: (err) =>
      toUserMessage(err, "Couldn't load business settings."),
    fetcher: async () => {
      const [profile, fnb] = await Promise.all([
        getBusinessProfile(),
        getFnbSettings(),
      ]);
      return { profile, fnb };
    },
  });

  const profile = data?.profile ?? null;
  const fnb = data?.fnb ?? null;

  return {
    profile,
    fnb,
    timezone: profile?.timezone || "UTC",
    slotDuration: fnb?.reservation_slot_duration_minutes ?? 90,
    minParty: fnb?.reservation_min_party_size ?? 1,
    maxParty: fnb?.reservation_max_party_size ?? 20,
    depositEnabled: fnb?.deposit_enabled ?? false,
    loading,
    error,
  };
}
