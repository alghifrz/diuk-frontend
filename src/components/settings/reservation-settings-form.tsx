"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { getFnbSettings, updateFnbSettings } from "@/lib/api/business";
import { toUserMessage } from "@/lib/api/errors";
import type { FnbSettings } from "@/types/reservation";

function amountToInput(value: number | string): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

export function ReservationSettingsForm() {
  const [settings, setSettings] = useState<FnbSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [enabled, setEnabled] = useState(true);
  const [slotMinutes, setSlotMinutes] = useState(90);
  const [minParty, setMinParty] = useState(1);
  const [maxParty, setMaxParty] = useState(8);
  const [minAdvance, setMinAdvance] = useState(60);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositType, setDepositType] = useState<"FIXED" | "PERCENTAGE">(
    "FIXED",
  );
  const [depositValue, setDepositValue] = useState("0");
  const [currency, setCurrency] = useState("IDR");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");

  useEffect(() => {
    let cancelled = false;

    getFnbSettings()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setSettings(data);
        setEnabled(data.reservation_enabled);
        setSlotMinutes(data.reservation_slot_duration_minutes);
        setMinParty(data.reservation_min_party_size);
        setMaxParty(data.reservation_max_party_size);
        setMinAdvance(data.reservation_min_advance_minutes);
        setMaxAdvanceDays(data.reservation_max_advance_days);
        setDepositEnabled(data.deposit_enabled);
        setDepositType(
          data.deposit_type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        );
        setDepositValue(amountToInput(data.deposit_value));
        setCurrency(data.currency || "IDR");
        setBankName(data.bank_name ?? "");
        setBankAccountNumber(data.bank_account_number ?? "");
        setBankAccountHolder(data.bank_account_holder ?? "");
        setError("");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(toUserMessage(err, "Couldn't load reservation settings."));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (minParty < 1 || maxParty < minParty) {
      setError("Party size range is invalid.");
      setSaving(false);
      return;
    }

    try {
      const saved = await updateFnbSettings({
        currency: currency.trim() || "IDR",
        reservation_enabled: enabled,
        reservation_slot_duration_minutes: slotMinutes,
        reservation_min_party_size: minParty,
        reservation_max_party_size: maxParty,
        reservation_min_advance_minutes: minAdvance,
        reservation_max_advance_days: maxAdvanceDays,
        deposit_enabled: depositEnabled,
        deposit_type: depositType,
        deposit_value: depositValue.trim() || "0",
        bank_name: bankName.trim(),
        bank_account_number: bankAccountNumber.trim(),
        bank_account_holder: bankAccountHolder.trim(),
      });
      setSettings(saved);
      setSuccess("Reservation settings saved.");
    } catch (err) {
      setError(toUserMessage(err, "Couldn't save reservation settings."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <Icon name="event" size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
            Booking rules
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">
            Reservation settings
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            Slot length, party size limits, advance window, and deposit rules.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3" aria-busy="true" aria-label="Loading settings">
          <div className="h-11 animate-pulse rounded-xl bg-surface-container-low" />
          <div className="h-11 animate-pulse rounded-xl bg-surface-container-low" />
          <div className="h-24 animate-pulse rounded-2xl bg-surface-container-low" />
        </div>
      ) : (
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
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
              role="status"
              className="flex items-start gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success"
            >
              <Icon name="check_circle" size={18} />
              <span>{success}</span>
            </p>
          ) : null}

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-background px-3 py-3">
            <span className="text-sm font-medium text-on-surface">
              Reservations enabled
            </span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => {
                setEnabled(event.target.checked);
                setSuccess("");
              }}
              className="size-4 rounded border-outline-variant text-primary focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Slot duration (minutes)"
              type="number"
              min={15}
              step={15}
              value={slotMinutes}
              onChange={(event) => {
                setSlotMinutes(Number(event.target.value) || 15);
                setSuccess("");
              }}
            />
            <Input
              label="Currency"
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value.toUpperCase());
                setSuccess("");
              }}
            />
            <Input
              label="Min party size"
              type="number"
              min={1}
              value={minParty}
              onChange={(event) => {
                setMinParty(Number(event.target.value) || 1);
                setSuccess("");
              }}
            />
            <Input
              label="Max party size"
              type="number"
              min={1}
              value={maxParty}
              onChange={(event) => {
                setMaxParty(Number(event.target.value) || 1);
                setSuccess("");
              }}
            />
            <Input
              label="Min advance (minutes)"
              type="number"
              min={0}
              value={minAdvance}
              onChange={(event) => {
                setMinAdvance(Number(event.target.value) || 0);
                setSuccess("");
              }}
            />
            <Input
              label="Max advance (days)"
              type="number"
              min={1}
              value={maxAdvanceDays}
              onChange={(event) => {
                setMaxAdvanceDays(Number(event.target.value) || 1);
                setSuccess("");
              }}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-outline-variant bg-background p-3">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-on-surface">
                Deposit required
              </span>
              <input
                type="checkbox"
                checked={depositEnabled}
                onChange={(event) => {
                  setDepositEnabled(event.target.checked);
                  setSuccess("");
                }}
                className="size-4 rounded border-outline-variant text-primary focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>

            {depositEnabled ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-on-surface">
                    Deposit type
                  </span>
                  <select
                    value={depositType}
                    onChange={(event) => {
                      setDepositType(
                        event.target.value === "PERCENTAGE"
                          ? "PERCENTAGE"
                          : "FIXED",
                      );
                      setSuccess("");
                    }}
                    className="min-h-11 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <option value="PERCENTAGE">Percentage of menu total</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </label>
                <Input
                  label={
                    depositType === "PERCENTAGE"
                      ? "Deposit value (%)"
                      : `Deposit value (${currency || "IDR"})`
                  }
                  value={depositValue}
                  onChange={(event) => {
                    setDepositValue(event.target.value);
                    setSuccess("");
                  }}
                  inputMode="decimal"
                />
                <p className="text-xs text-on-surface-variant sm:col-span-2">
                  AI bookings ask guests for FULL (100% of pre-order) or DEPOSIT
                  using this rule. Prefer percentage so the amount follows the
                  menu order total.
                </p>
              </div>
            ) : null}
          </div>

          {depositEnabled ? (
            <div className="space-y-3 rounded-2xl border border-outline-variant bg-background p-3">
              <p className="text-sm font-medium text-on-surface">
                Bank transfer details
              </p>
              <p className="text-xs text-on-surface-variant">
                AI will tell guests to transfer the deposit/full amount to this
                account after booking is recorded.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Bank name"
                  value={bankName}
                  onChange={(event) => {
                    setBankName(event.target.value);
                    setSuccess("");
                  }}
                  placeholder="BCA"
                />
                <Input
                  label="Account holder"
                  value={bankAccountHolder}
                  onChange={(event) => {
                    setBankAccountHolder(event.target.value);
                    setSuccess("");
                  }}
                  placeholder="Kasiko Coffee"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Account number"
                    value={bankAccountNumber}
                    onChange={(event) => {
                      setBankAccountNumber(event.target.value);
                      setSuccess("");
                    }}
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {settings ? (
            <p className="text-xs text-on-surface-variant">
              Business ID {settings.business_id}
            </p>
          ) : null}

          <div className="pt-1 sm:max-w-[12rem]">
            <Button type="submit" loading={saving}>
              Save settings
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
