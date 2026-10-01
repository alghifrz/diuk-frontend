"use client";

import { useMemo } from "react";
import { getAnalyticsRevenue } from "@/lib/api/analytics";
import { getAISettings, listPrompts } from "@/lib/api/ai";
import { getBusinessProfile, getFnbSettings } from "@/lib/api/business";
import { getCalendarDay } from "@/lib/api/calendar";
import { listChannels } from "@/lib/api/channels";
import { listConversations, listHumanInbox } from "@/lib/api/conversations";
import { toUserMessage } from "@/lib/api/errors";
import { listMenuItems } from "@/lib/api/menu";
import { listReservations } from "@/lib/api/reservations";
import { businessToday } from "@/lib/business-time";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { getWorkspaceId } from "@/lib/workspace";
import { DEFAULT_PROMPT_NAME } from "@/types/ai";
import type { AnalyticsRevenueReport } from "@/types/analytics";
import type { AIPrompt, AISettings } from "@/types/ai";
import type { BusinessChannel } from "@/types/channel";
import type { Conversation } from "@/types/chat";
import type { MenuItem } from "@/types/menu";
import type {
  BusinessProfile,
  CalendarDayView,
  FnbSettings,
  Reservation,
} from "@/types/reservation";

const TTL_MS = 30_000;
const RECENT_MENU_LIMIT = 8;

export type DashboardOverview = {
  profile: BusinessProfile | null;
  fnb: FnbSettings | null;
  today: string;
  timezone: string;
  reservationsToday: Reservation[];
  calendar: CalendarDayView | null;
  unreadConversations: Conversation[];
  humanRequested: Conversation[];
  channels: BusinessChannel[];
  aiSettings: AISettings | null;
  activePrompt: AIPrompt | null;
  recentMenuItems: MenuItem[];
  revenueToday: AnalyticsRevenueReport | null;
  revenueMonth: AnalyticsRevenueReport | null;
};

async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export function useDashboardOverview() {
  const workspaceId = getWorkspaceId();

  const { data, loading, error, refetch } = useCachedResource<DashboardOverview>({
    key: workspaceId ? "dashboard:overview:v4" : null,
    ttlMs: TTL_MS,
    mapError: (err) =>
      toUserMessage(err, "Couldn't load your workspace overview."),
    fetcher: async () => {
      const [profile, fnb] = await Promise.all([
        getBusinessProfile(),
        getFnbSettings(),
      ]);
      const timezone = profile.timezone || "UTC";
      const today = businessToday(timezone);
      const monthStart = `${today.slice(0, 8)}01`;

      const [
        reservationsToday,
        calendar,
        unreadConversations,
        humanRequested,
        channels,
        aiSettings,
        activePrompts,
        menuItems,
        revenueToday,
        revenueMonth,
      ] = await Promise.all([
        settle(listReservations({ date: today, limit: 100 }), [] as Reservation[]),
        settle(getCalendarDay({ date: today }), null as CalendarDayView | null),
        settle(
          listConversations({ unread: true, limit: 50 }),
          [] as Conversation[],
        ),
        settle(
          listHumanInbox({ state: "HUMAN_REQUESTED", limit: 20 }),
          [] as Conversation[],
        ),
        settle(listChannels(), [] as BusinessChannel[]),
        settle(getAISettings(), null as AISettings | null),
        settle(
          listPrompts({ name: DEFAULT_PROMPT_NAME, status: "ACTIVE" }),
          [] as AIPrompt[],
        ),
        settle(listMenuItems({ status: "ACTIVE" }), [] as MenuItem[]),
        settle(
          getAnalyticsRevenue({ from: today, to: today }),
          null as AnalyticsRevenueReport | null,
        ),
        settle(
          getAnalyticsRevenue({ from: monthStart, to: today }),
          null as AnalyticsRevenueReport | null,
        ),
      ]);

      const recentMenuItems = [...menuItems]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, RECENT_MENU_LIMIT);

      return {
        profile,
        fnb,
        today,
        timezone,
        reservationsToday,
        calendar,
        unreadConversations,
        humanRequested,
        channels,
        aiSettings,
        activePrompt: activePrompts[0] ?? null,
        recentMenuItems,
        revenueToday,
        revenueMonth,
      };
    },
  });

  const stats = useMemo(() => {
    const rows = data?.reservationsToday ?? [];
    const pending = rows.filter((item) => item.status === "PENDING").length;
    const confirmed = rows.filter((item) => item.status === "CONFIRMED").length;
    const completed = rows.filter((item) => item.status === "COMPLETED").length;
    const cancelled = rows.filter((item) => item.status === "CANCELLED").length;
    const unreadMessages = (data?.unreadConversations ?? []).reduce(
      (sum, item) => sum + item.unread_count,
      0,
    );
    const whatsapp = (data?.channels ?? []).find(
      (item) => item.channel === "WHATSAPP",
    );
    const todaySummary = data?.revenueToday?.summary;
    const monthSummary = data?.revenueMonth?.summary;

    return {
      todayTotal: rows.length,
      pending,
      confirmed,
      completed,
      cancelled,
      unreadMessages,
      humanRequested: data?.humanRequested.length ?? 0,
      reservationsEnabled: data?.fnb?.reservation_enabled ?? false,
      aiEnabled: data?.aiSettings?.enabled ?? false,
      hasLivePrompt: Boolean(data?.activePrompt),
      whatsappActive: whatsapp?.status === "ACTIVE",
      whatsappConnected: Boolean(whatsapp),
      hours: data?.calendar?.hours ?? [],
      closed: data?.calendar?.closed ?? false,
      currency: data?.fnb?.currency || "IDR",
      revenueTodayCollected: todaySummary?.paid_amount ?? 0,
      revenueTodayOutstanding: todaySummary?.unpaid_amount ?? 0,
      revenueTodayPaidCount: todaySummary?.paid_count ?? 0,
      revenueTodayUnpaidCount: todaySummary?.unpaid_count ?? 0,
      revenueMonthCollected: monthSummary?.paid_amount ?? 0,
      revenueMonthOutstanding: monthSummary?.unpaid_amount ?? 0,
      revenueMonthPaidCount: monthSummary?.paid_count ?? 0,
      revenueCollectionRate: monthSummary?.payment_collection_rate ?? 0,
      revenueSeries: data?.revenueMonth?.series ?? [],
    };
  }, [data]);

  return {
    overview: data,
    stats,
    loading,
    error,
    refetch,
  };
}
