import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  AnalyticsAI,
  AnalyticsAutomation,
  AnalyticsCampaigns,
  AnalyticsConversations,
  AnalyticsConversion,
  AnalyticsConversionDay,
  AnalyticsCustomers,
  AnalyticsEnvelope,
  AnalyticsHandover,
  AnalyticsMessaging,
  AnalyticsOverview,
  AnalyticsReport,
  AnalyticsReservationDay,
  AnalyticsReservations,
  AnalyticsRevenueDay,
  AnalyticsRevenueReport,
  AnalyticsRevenueSummary,
  SeriesPoint,
} from "@/types/analytics";

export type AnalyticsRangeParams = { from?: string; to?: string };

function get<T>(path: string, params: AnalyticsRangeParams) {
  return apiRequest<T>(
    `/api/v1/analytics/${path}${toQuery({ from: params.from, to: params.to })}`,
  );
}

export const getAnalyticsOverview = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsEnvelope<AnalyticsOverview>>("overview", p);

export const getAnalyticsRevenue = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsRevenueSummary, AnalyticsRevenueDay>>(
    "revenue",
    p,
  ) as Promise<AnalyticsRevenueReport>;

export const getAnalyticsReservations = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsReservations, AnalyticsReservationDay>>(
    "reservations",
    p,
  );

export const getAnalyticsConversion = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsConversion, AnalyticsConversionDay>>(
    "conversion",
    p,
  );

export const getAnalyticsCustomers = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsCustomers, SeriesPoint>>("customers", p);

export const getAnalyticsConversations = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsConversations, SeriesPoint>>("conversations", p);

export const getAnalyticsAI = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsAI, SeriesPoint>>("ai", p);

export const getAnalyticsHandover = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsHandover, SeriesPoint>>("handover", p);

export const getAnalyticsAutomation = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsAutomation, SeriesPoint>>("automation", p);

export const getAnalyticsMessaging = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsMessaging, SeriesPoint>>("messaging", p);

export const getAnalyticsCampaigns = (p: AnalyticsRangeParams = {}) =>
  get<AnalyticsReport<AnalyticsCampaigns, SeriesPoint>>("campaigns", p);
