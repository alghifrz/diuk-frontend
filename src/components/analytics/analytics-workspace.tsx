"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RangePicker } from "@/components/analytics/range-picker";
import { Skeleton } from "@/components/analytics/primitives";
import { ChatsTab } from "@/components/analytics/tabs/chats-tab";
import { GuestsTab } from "@/components/analytics/tabs/guests-tab";
import { MessagingTab } from "@/components/analytics/tabs/messaging-tab";
import { OverviewTab } from "@/components/analytics/tabs/overview-tab";
import { ReservationsTab } from "@/components/analytics/tabs/reservations-tab";
import { RevenueTab } from "@/components/analytics/tabs/revenue-tab";
import { Icon } from "@/components/ui/icon";
import { useBusinessContext } from "@/hooks/use-business-context";
import {
  isValidRange,
  previousRange,
  rangeLabel,
  resolveRange,
  type DateRange,
  type RangePreset,
} from "@/lib/analytics-report";
import { businessToday } from "@/lib/business-time";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "revenue", label: "Revenue", icon: "payments" },
  { id: "reservations", label: "Reservations", icon: "event" },
  { id: "guests", label: "Guests", icon: "group" },
  { id: "chats", label: "Chats & AI", icon: "psychology" },
  { id: "messaging", label: "Messaging", icon: "forum" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

export function AnalyticsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TabId = isTabId(requested) ? requested : "overview";

  const business = useBusinessContext();
  const currency = business.fnb?.currency || "IDR";
  const today = useMemo(() => businessToday(business.timezone), [business.timezone]);

  const [preset, setPreset] = useState<RangePreset>("30d");
  const [custom, setCustom] = useState<DateRange>({ from: "", to: "" });

  const customForPreset = useMemo<DateRange>(
    () =>
      custom.from && custom.to
        ? custom
        : resolveRange("30d", today),
    [custom, today],
  );

  const resolved = useMemo(
    () => resolveRange(preset, today, customForPreset),
    [preset, today, customForPreset],
  );

  // Keep showing the last valid range while a custom range is half-typed.
  const [lastValid, setLastValid] = useState<DateRange | null>(null);
  const valid = isValidRange(resolved);
  if (valid && (!lastValid || lastValid.from !== resolved.from || lastValid.to !== resolved.to)) {
    setLastValid(resolved);
  }
  const range = valid ? resolved : (lastValid ?? resolveRange("30d", today));
  const previous = useMemo(() => previousRange(range), [range]);

  const selectTab = useCallback(
    (next: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handlePreset = (next: RangePreset) => {
    if (next === "custom" && !(custom.from && custom.to)) {
      setCustom(range);
    }
    setPreset(next);
  };

  const tabProps = {
    range,
    previous,
    currency,
    rangeSlug: `${range.from}_${range.to}`,
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-on-surface">{rangeLabel(range)}</p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Compared with {rangeLabel(previous)} · times in {business.timezone}
          </p>
        </div>
        <RangePicker
          preset={preset}
          onPresetChange={handlePreset}
          custom={customForPreset}
          onCustomChange={setCustom}
          max={today}
        />
      </div>

      <div
        role="tablist"
        aria-label="Report sections"
        className="-mx-1 flex gap-1 overflow-x-auto border-b border-outline-variant px-1"
      >
        {TABS.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`analytics-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="analytics-panel"
              onClick={() => selectTab(item.id)}
              className={cn(
                "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "border-primary text-on-surface"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id="analytics-panel"
        role="tabpanel"
        aria-labelledby={`analytics-tab-${tab}`}
      >
        {business.loading ? (
          <Skeleton className="h-64" />
        ) : (
          <>
            {tab === "overview" ? <OverviewTab {...tabProps} /> : null}
            {tab === "revenue" ? <RevenueTab {...tabProps} /> : null}
            {tab === "reservations" ? <ReservationsTab {...tabProps} /> : null}
            {tab === "guests" ? <GuestsTab {...tabProps} /> : null}
            {tab === "chats" ? <ChatsTab {...tabProps} /> : null}
            {tab === "messaging" ? <MessagingTab {...tabProps} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
