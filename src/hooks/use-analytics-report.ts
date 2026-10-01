"use client";

import { useCachedResource } from "@/hooks/use-cached-resource";
import {
  getAnalyticsAI,
  getAnalyticsAutomation,
  getAnalyticsCampaigns,
  getAnalyticsConversations,
  getAnalyticsConversion,
  getAnalyticsCustomers,
  getAnalyticsHandover,
  getAnalyticsMessaging,
  getAnalyticsOverview,
  getAnalyticsReservations,
  getAnalyticsRevenue,
  type AnalyticsRangeParams,
} from "@/lib/api/analytics";
import { toUserMessage } from "@/lib/api/errors";
import type { DateRange } from "@/lib/analytics-report";
import { getWorkspaceId } from "@/lib/workspace";

const TTL_MS = 60_000;

const REPORTS = {
  overview: getAnalyticsOverview,
  revenue: getAnalyticsRevenue,
  reservations: getAnalyticsReservations,
  conversion: getAnalyticsConversion,
  customers: getAnalyticsCustomers,
  conversations: getAnalyticsConversations,
  ai: getAnalyticsAI,
  handover: getAnalyticsHandover,
  automation: getAnalyticsAutomation,
  messaging: getAnalyticsMessaging,
  campaigns: getAnalyticsCampaigns,
} as const;

export type ReportName = keyof typeof REPORTS;
export type ReportData<N extends ReportName> = Awaited<
  ReturnType<(typeof REPORTS)[N]>
>;

/**
 * One analytics endpoint for one date range. Pass `range = null` to keep it
 * idle (e.g. the tab that needs it isn't open yet). Results are cached per
 * range, so switching tabs back and forth doesn't refetch.
 */
export function useReport<N extends ReportName>(
  name: N,
  range: DateRange | null,
) {
  const workspaceId = getWorkspaceId();
  const key =
    range && workspaceId
      ? `analytics:${workspaceId}:${name}:${range.from}:${range.to}`
      : null;

  return useCachedResource<ReportData<N>>({
    key,
    ttlMs: TTL_MS,
    mapError: (err) => toUserMessage(err, "Couldn't load this report."),
    fetcher: () =>
      (
        REPORTS[name] as unknown as (
          params: AnalyticsRangeParams,
        ) => Promise<ReportData<N>>
      )({ from: range?.from, to: range?.to }),
  });
}
