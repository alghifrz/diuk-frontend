"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { createChannel, updateChannel } from "@/lib/api/channels";
import { toUserMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatInboxTime } from "@/lib/format-time";
import type { BusinessChannel } from "@/types/channel";

type WhatsAppChannelFormProps = {
  channels: BusinessChannel[];
  onSaved: (channel: BusinessChannel) => void;
};

function firstWhatsApp(channels: BusinessChannel[]) {
  return (
    channels.find((item) => item.channel === "WHATSAPP" && item.status === "ACTIVE") ??
    channels.find((item) => item.channel === "WHATSAPP") ??
    null
  );
}

export function WhatsAppChannelForm({ channels, onSaved }: WhatsAppChannelFormProps) {
  const existing = useMemo(() => firstWhatsApp(channels), [channels]);
  const connected = existing?.status === "ACTIVE";
  const [phoneNumberId, setPhoneNumberId] = useState(existing?.external_phone_number_id ?? "");
  const [displayName, setDisplayName] = useState(existing?.display_name ?? "");
  const [accountId, setAccountId] = useState(existing?.external_account_id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const phone = phoneNumberId.trim();
    if (!phone) {
      setError("Phone number ID is required.");
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const saved = existing
        ? await updateChannel(existing.id, {
            external_phone_number_id: phone,
            display_name: displayName.trim() || null,
            external_account_id: accountId.trim() || null,
            status: "ACTIVE",
          })
        : await createChannel({
            channel: "WHATSAPP",
            external_phone_number_id: phone,
            display_name: displayName.trim() || undefined,
            external_account_id: accountId.trim() || undefined,
          });

      onSaved(saved);
      setSuccess(existing ? "WhatsApp channel updated." : "WhatsApp channel saved.");
    } catch (err) {
      setError(toUserMessage(err, "Couldn't save the WhatsApp channel."));
    } finally {
      setSaving(false);
    }
  }

  const updatedLabel = existing ? formatInboxTime(existing.updated_at) : "";

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary-dark">
            <Icon name="chat" size={24} />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
              Channel
            </p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">
              WhatsApp
            </h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Connect this workspace with the Meta Phone number ID.
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            connected
              ? "bg-primary/15 text-primary-dark"
              : existing
                ? "bg-warning/15 text-warning"
                : "bg-surface-container-low text-on-surface-variant",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              connected ? "bg-primary-dark" : existing ? "bg-warning" : "bg-outline",
            )}
          />
          {connected ? "Connected" : existing ? "Inactive" : "Not connected"}
        </span>
      </div>

      {existing ? (
        <div className="mt-5 grid gap-2 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
              Display name
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-on-surface">
              {existing.display_name || "—"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
              Phone number ID
            </p>
            <p className="mt-0.5 truncate font-mono text-sm text-on-surface">
              {existing.external_phone_number_id || "—"}
            </p>
          </div>
        </div>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <Input
          id="phone-number-id"
          name="phoneNumberId"
          label="Phone number ID"
          leadingIcon="pin"
          value={phoneNumberId}
          onChange={(event) => setPhoneNumberId(event.target.value)}
          placeholder="From WhatsApp API Setup"
          autoComplete="off"
          disabled={saving}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="channel-display-name"
            name="displayName"
            label="Display name"
            leadingIcon="storefront"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Optional"
            autoComplete="off"
            disabled={saving}
          />
          <Input
            id="waba-id"
            name="accountId"
            label="WABA ID"
            leadingIcon="badge"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder="Optional"
            autoComplete="off"
            disabled={saving}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"
          >
            <Icon name="error" size={18} />
            <span>{error}</span>
          </p>
        ) : null}

        {success ? (
          <p
            className="flex items-start gap-2 rounded-xl bg-primary/15 px-3 py-2.5 text-sm text-primary-dark"
            role="status"
          >
            <Icon name="check_circle" size={18} />
            <span>{success}</span>
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-outline-variant pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-on-surface-variant">
            Use the Phone number ID, not the +62 display number.
            {updatedLabel ? ` Last saved ${updatedLabel}.` : ""}
          </p>
          <Button type="submit" loading={saving} className="sm:w-auto">
            {existing ? "Save channel" : "Connect WhatsApp"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
