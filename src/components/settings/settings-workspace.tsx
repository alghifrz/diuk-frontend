"use client";

import { useState } from "react";
import { AutomationList } from "@/components/settings/automation-list";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";
import { BusinessHoursForm } from "@/components/settings/business-hours-form";
import { ReservationSettingsForm } from "@/components/settings/reservation-settings-form";
import { ScheduleExceptionsForm } from "@/components/settings/schedule-exceptions-form";
import { WhatsAppChannelForm } from "@/components/settings/whatsapp-channel-form";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useChannels } from "@/hooks/use-channels";
import { cn } from "@/lib/cn";
import type { BusinessChannel } from "@/types/channel";

type SettingsTab = "business" | "whatsapp" | "automations" | "reservations";

const TABS: Array<{ id: SettingsTab; label: string; icon: string }> = [
  { id: "business", label: "Business", icon: "storefront" },
  { id: "whatsapp", label: "WhatsApp", icon: "chat" },
  { id: "automations", label: "Automations", icon: "bolt" },
  { id: "reservations", label: "Reservations", icon: "event" },
];

export function SettingsWorkspace() {
  const { workspaceId, channels, loading, error, reload, setChannels } =
    useChannels();
  const [tab, setTab] = useState<SettingsTab>("business");

  if (!workspaceId) {
    return (
      <Card className="mx-auto max-w-2xl" padding="lg">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
          <Icon name="settings" size={24} />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-on-surface">
          Workspace is not configured
        </h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Set NEXT_PUBLIC_BUSINESS_ID to the business UUID for the signed-in user.
          Settings use that workspace and do not invent a tenant.
        </p>
      </Card>
    );
  }

  function handleSaved(channel: BusinessChannel) {
    setChannels((current) => {
      const exists = current.some((item) => item.id === channel.id);
      if (exists) {
        return current.map((item) => (item.id === channel.id ? channel : item));
      }
      return [...current, channel];
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="inline-flex flex-wrap gap-1 rounded-2xl border border-outline-variant bg-surface p-1"
      >
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "bg-background text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "business" ? <BusinessProfileForm /> : null}

      {tab === "whatsapp" ? (
        loading ? (
          <Card padding="lg">
            <div
              className="space-y-4"
              aria-busy="true"
              aria-label="Loading WhatsApp settings"
            >
              <div className="flex items-center gap-3">
                <div className="size-12 animate-pulse rounded-2xl bg-surface-container-low" />
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-surface-container-low" />
                  <div className="h-3 w-48 animate-pulse rounded bg-surface-container-low" />
                </div>
              </div>
              <div className="h-24 animate-pulse rounded-2xl bg-surface-container-low" />
              <div className="h-11 animate-pulse rounded-xl bg-surface-container-low" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-error/10 text-error">
              <Icon name="error" size={24} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-on-surface">
              WhatsApp
            </h3>
            <p className="mt-2 text-sm text-error">{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-4 inline-flex min-h-10 items-center rounded-xl border border-outline-variant bg-surface px-3 text-sm font-medium text-on-surface transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Try again
            </button>
          </Card>
        ) : (
          <WhatsAppChannelForm channels={channels} onSaved={handleSaved} />
        )
      ) : null}

      {tab === "automations" ? <AutomationList /> : null}

      {tab === "reservations" ? (
        <div className="flex flex-col gap-5">
          <BusinessHoursForm />
          <ReservationSettingsForm />
          <ScheduleExceptionsForm />
        </div>
      ) : null}
    </div>
  );
}
