"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { getBusinessProfile, updateBusinessProfile } from "@/lib/api/business";
import { toUserMessage } from "@/lib/api/errors";
import type { BusinessProfile } from "@/types/reservation";

type Fields = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
};

const EMPTY: Fields = {
  name: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  description: "",
};

function fromProfile(profile: BusinessProfile): Fields {
  return {
    name: profile.name,
    address: profile.address ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    website: profile.website_url ?? "",
    description: profile.description ?? "",
  };
}

export function BusinessProfileForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    getBusinessProfile()
      .then((profile) => {
        if (cancelled) {
          return;
        }
        setFields(fromProfile(profile));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(toUserMessage(err, "Couldn't load business profile."));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!fields.name.trim()) {
      setError("Business name is required.");
      return;
    }

    setSaving(true);
    try {
      // An empty string clears an optional field on the server.
      const saved = await updateBusinessProfile({
        name: fields.name.trim(),
        address: fields.address.trim(),
        phone: fields.phone.trim(),
        email: fields.email.trim(),
        website_url: fields.website.trim(),
        description: fields.description.trim(),
      });
      setFields(fromProfile(saved));
      setSuccess("Business profile saved.");
    } catch (err) {
      setError(toUserMessage(err, "Couldn't save business profile."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon name="storefront" size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
            Profile
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">
            Business information
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            Address, contact, and description. The AI answers from these fields
            first, then falls back to your Knowledge documents.
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="mt-5 space-y-3"
          aria-busy="true"
          aria-label="Loading business profile"
        >
          <div className="h-11 animate-pulse rounded-xl bg-surface-container-low" />
          <div className="h-24 animate-pulse rounded-2xl bg-surface-container-low" />
          <div className="h-11 animate-pulse rounded-xl bg-surface-container-low" />
        </div>
      ) : (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-5 space-y-4"
        >
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

          <Input
            label="Business name"
            value={fields.name}
            onChange={(event) => set("name", event.target.value)}
            maxLength={150}
            required
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-on-surface">
              Address
            </span>
            <textarea
              value={fields.address}
              onChange={(event) => set("address", event.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Jl. Contoh No. 12, Kelurahan, Kecamatan, Kota"
              className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Phone"
              type="tel"
              value={fields.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="+62 812 0000 0000"
            />
            <Input
              label="Email"
              type="email"
              value={fields.email}
              onChange={(event) => set("email", event.target.value)}
              placeholder="hello@example.com"
            />
          </div>

          <Input
            label="Website or maps link"
            type="url"
            value={fields.website}
            onChange={(event) => set("website", event.target.value)}
            placeholder="https://maps.app.goo.gl/..."
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-on-surface">
              Description
            </span>
            <textarea
              value={fields.description}
              onChange={(event) => set("description", event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Short intro the AI can use when guests ask about you"
              className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </label>

          <div className="pt-1 sm:max-w-[12rem]">
            <Button type="submit" loading={saving}>
              Save profile
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
