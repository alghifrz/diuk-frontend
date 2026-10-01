"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CustomerMonogram } from "@/components/customers/customer-monogram";
import { CustomerStageBadge } from "@/components/customers/customer-stage-badge";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatBusinessDate, formatBusinessTime } from "@/lib/business-time";
import { cn } from "@/lib/cn";
import {
  averageSpend,
  customerStage,
  formatRelativeDay,
  statsOf,
  toNumber,
  whatsappLink,
} from "@/lib/customer-crm";
import { formatMenuPrice } from "@/lib/format-price";
import type { Customer, CustomerTag } from "@/types/customer";
import type { Reservation } from "@/types/reservation";

type CustomerDetailProps = {
  customer: Customer | null;
  reservations: Reservation[] | null;
  allTags: CustomerTag[];
  currency: string;
  timezone: string;
  loading: boolean;
  error: string;
  actionError: string;
  busy: string | null;
  onBack?: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onAddTag: (name: string) => void;
  onRemoveTag: (tagId: string) => void;
  onSaveNotes: (notes: string) => void;
  onRetry: () => void;
};

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-5" aria-label="Loading customer">
      <div className="flex items-center gap-3">
        <div className="size-16 animate-pulse rounded-full bg-surface-container-low" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-container-low" />
          <div className="h-4 w-56 animate-pulse rounded bg-surface-container-low" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`detail-skeleton-${index}`}
            className="h-20 animate-pulse rounded-2xl bg-surface-container-low"
          />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-surface-container-low" />
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] font-semibold tracking-[0.16em] text-on-surface-variant uppercase">
      {children}
    </h3>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5",
        accent
          ? "border-primary/30 bg-primary/5"
          : "border-outline-variant bg-background",
      )}
    >
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <Icon name={icon} size={14} />
        <span className="text-[11px] font-semibold tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-lg font-semibold tracking-tight tabular-nums text-on-surface">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

function ContactLink({
  href,
  icon,
  label,
  external = false,
}: {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-2.5 text-sm text-on-surface transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Icon name={icon} size={16} className="shrink-0 text-secondary" />
      <span className="truncate">{label}</span>
    </a>
  );
}

function TagEditor({
  customer,
  allTags,
  busy,
  onAddTag,
  onRemoveTag,
}: {
  customer: Customer;
  allTags: CustomerTag[];
  busy: boolean;
  onAddTag: (name: string) => void;
  onRemoveTag: (tagId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const assigned = (customer.tags ?? []).filter((tag) => tag.status === "ACTIVE");
  const assignedIds = new Set(assigned.map((tag) => tag.id));
  const trimmed = query.trim();
  const needle = trimmed.toLowerCase();
  const suggestions = allTags
    .filter((tag) => !assignedIds.has(tag.id))
    .filter((tag) => !needle || tag.name.toLowerCase().includes(needle))
    .slice(0, 6);
  const exact = allTags.some((tag) => tag.name.toLowerCase() === needle);

  function submit(name: string) {
    const value = name.trim();
    if (!value) {
      return;
    }
    onAddTag(value);
    setQuery("");
    setAdding(false);
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {assigned.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full bg-secondary/10 py-0.5 pr-1 pl-2.5 text-xs font-medium text-secondary"
          >
            {tag.name}
            <button
              type="button"
              disabled={busy}
              aria-label={`Remove tag ${tag.name}`}
              onClick={() => onRemoveTag(tag.id)}
              className="inline-flex size-5 items-center justify-center rounded-full hover:bg-secondary/15 disabled:opacity-50"
            >
              <Icon name="close" size={12} />
            </button>
          </span>
        ))}
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex min-h-7 items-center gap-1 rounded-full border border-dashed border-outline px-2.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary hover:text-primary-dark"
          >
            <Icon name="add" size={14} />
            Tag
          </button>
        ) : null}
      </div>

      {assigned.length === 0 && !adding ? (
        <p className="mt-2 text-xs text-on-surface-variant">
          Tag guests (e.g. “Birthday”, “Allergy: nuts”) to find them later.
        </p>
      ) : null}

      {adding ? (
        <div className="mt-2 rounded-xl border border-outline-variant bg-background p-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={query}
              maxLength={50}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submit(trimmed);
                }
                if (event.key === "Escape") {
                  setAdding(false);
                  setQuery("");
                }
              }}
              placeholder="Search or create a tag"
              aria-label="Tag name"
              className="min-h-9 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setQuery("");
              }}
              className="inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface"
              aria-label="Cancel adding tag"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                disabled={busy}
                onClick={() => submit(tag.name)}
                className="rounded-full border border-outline-variant bg-surface px-2.5 py-1 text-xs font-medium text-on-surface hover:border-primary disabled:opacity-50"
              >
                {tag.name}
              </button>
            ))}
            {trimmed && !exact ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => submit(trimmed)}
                className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary-dark hover:bg-primary/25 disabled:opacity-50"
              >
                <Icon name="add" size={12} />
                Create “{trimmed}”
              </button>
            ) : null}
            {suggestions.length === 0 && !trimmed ? (
              <p className="text-xs text-on-surface-variant">
                No more tags yet — type a name to create one.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotesEditor({
  customer,
  busy,
  onSave,
}: {
  customer: Customer;
  busy: boolean;
  onSave: (notes: string) => void;
}) {
  const saved = customer.notes ?? "";
  const [draft, setDraft] = useState(saved);
  const dirty = draft.trim() !== saved.trim();

  return (
    <div className="mt-2">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={4}
        placeholder="Preferences, allergies, special dates…"
        aria-label="Customer notes"
        className="w-full rounded-xl border border-outline-variant bg-background px-3 py-2.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      {dirty ? (
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-auto min-h-9 px-3"
            disabled={busy}
            onClick={() => setDraft(saved)}
          >
            Reset
          </Button>
          <Button
            className="w-auto min-h-9 px-3"
            loading={busy}
            onClick={() => onSave(draft.trim())}
          >
            Save notes
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function CustomerDetail({
  customer,
  reservations,
  allTags,
  currency,
  timezone,
  loading,
  error,
  actionError,
  busy,
  onBack,
  onEdit,
  onArchive,
  onAddTag,
  onRemoveTag,
  onSaveNotes,
  onRetry,
}: CustomerDetailProps) {
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <p className="text-sm font-medium text-on-surface">{error}</p>
        <div className="w-full max-w-40">
          <Button variant="ghost" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-low text-secondary">
          <Icon name="contacts" size={28} />
        </span>
        <p className="mt-4 text-sm font-semibold text-on-surface">
          Select a customer
        </p>
        <p className="mt-1 max-w-xs text-sm text-on-surface-variant">
          See their visit history, lifetime spend, tags, and notes in one place.
        </p>
      </div>
    );
  }

  const stats = statsOf(customer);
  const stage = customerStage(customer);
  const spent = toNumber(stats.total_spent);
  const average = averageSpend(customer);
  const wa = whatsappLink(customer);
  const identities = (customer.identities ?? []).filter(
    (identity) => identity.status === "ACTIVE",
  );
  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(new Date(customer.created_at));
  const cancelRate =
    stats.reservation_count > 0
      ? Math.round((stats.cancelled_count / stats.reservation_count) * 100)
      : 0;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      {onBack ? (
        <div className="border-b border-outline-variant bg-surface px-3 py-2 lg:hidden">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-secondary hover:bg-background"
          >
            <Icon name="arrow_back" size={18} />
            Customers
          </button>
        </div>
      ) : null}

      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-4 sm:p-5">
        <header className="flex flex-wrap items-start gap-4">
          <CustomerMonogram
            name={customer.name}
            size="lg"
            vip={stage === "VIP"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight text-on-surface">
                {customer.name}
              </h2>
              <CustomerStageBadge stage={stage} />
            </div>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Customer since {memberSince}
              {customer.marketing_opt_in ? " · Accepts promotions" : " · No promotions"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {customer.phone ? (
                <ContactLink
                  href={`tel:${customer.phone}`}
                  icon="call"
                  label={customer.phone}
                />
              ) : null}
              {wa ? (
                <ContactLink href={wa} icon="chat" label="WhatsApp" external />
              ) : null}
              {customer.email ? (
                <ContactLink
                  href={`mailto:${customer.email}`}
                  icon="mail"
                  label={customer.email}
                />
              ) : null}
              {!customer.phone && !customer.email && !wa ? (
                <p className="text-sm text-on-surface-variant">
                  No contact details yet.
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 text-sm font-medium text-on-surface transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none"
            >
              <Icon name="edit" size={16} />
              Edit
            </button>
            <Link
              href="/reservations"
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:flex-none"
            >
              <Icon name="event" size={16} />
              Book
            </Link>
          </div>
        </header>

        {actionError ? (
          <p
            role="alert"
            className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {actionError}
          </p>
        ) : null}

        <section aria-label="Customer value">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              icon="payments"
              label="Lifetime spend"
              value={spent > 0 ? formatMenuPrice(spent, currency) : "—"}
              hint="Completed bookings"
              accent
            />
            <StatCard
              icon="check_circle"
              label="Visits"
              value={String(stats.completed_count)}
              hint={
                average > 0
                  ? `${formatMenuPrice(Math.round(average), currency)} avg`
                  : "No completed visits"
              }
            />
            <StatCard
              icon="event_note"
              label="Bookings"
              value={String(stats.reservation_count)}
              hint={
                stats.cancelled_count > 0
                  ? `${stats.cancelled_count} cancelled (${cancelRate}%)`
                  : "None cancelled"
              }
            />
            <StatCard
              icon="history"
              label="Last visit"
              value={formatRelativeDay(stats.last_visit_at)}
            />
            <StatCard
              icon="event_upcoming"
              label="Next booking"
              value={formatRelativeDay(stats.next_reservation_at)}
            />
            <StatCard
              icon="forum"
              label="Channels"
              value={String(identities.length)}
              hint={identities.length === 1 ? "Linked account" : "Linked accounts"}
            />
          </div>
        </section>

        <section>
          <SectionLabel>Tags</SectionLabel>
          <TagEditor
            key={`tags-${customer.id}`}
            customer={customer}
            allTags={allTags}
            busy={busy === "tag"}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />
        </section>

        <section>
          <SectionLabel>Notes</SectionLabel>
          <NotesEditor
            key={`notes-${customer.id}-${customer.updated_at}`}
            customer={customer}
            busy={busy === "notes"}
            onSave={onSaveNotes}
          />
        </section>

        {identities.length > 0 ? (
          <section>
            <SectionLabel>Channels</SectionLabel>
            <ul className="mt-2 space-y-1.5">
              {identities.map((identity) => (
                <li
                  key={identity.id}
                  className="flex items-center gap-2 rounded-xl border border-outline-variant bg-background px-3 py-2 text-sm"
                >
                  <Icon
                    name={
                      identity.channel === "WHATSAPP"
                        ? "chat"
                        : identity.channel === "INSTAGRAM"
                          ? "photo_camera"
                          : "language"
                    }
                    size={16}
                    className="text-secondary"
                  />
                  <span className="font-medium text-on-surface">
                    {identity.channel.charAt(0) +
                      identity.channel.slice(1).toLowerCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-on-surface-variant">
                    {identity.display_name || identity.external_id}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <div className="flex items-center justify-between">
            <SectionLabel>Reservation history</SectionLabel>
            {reservations && reservations.length > 0 ? (
              <span className="text-xs text-on-surface-variant">
                {reservations.length} shown
              </span>
            ) : null}
          </div>
          {reservations === null ? (
            <p className="mt-2 text-sm text-on-surface-variant">
              Reservation history is unavailable right now.
            </p>
          ) : reservations.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-outline-variant px-3 py-4 text-center text-sm text-on-surface-variant">
              No reservations yet.
            </p>
          ) : (
            <ol className="mt-2 space-y-2">
              {reservations.map((reservation) => {
                const date = formatBusinessDate(reservation.start_at, timezone);
                return (
                  <li key={reservation.id}>
                    <Link
                      href={`/reservations?date=${date}&reservation=${reservation.id}`}
                      className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface px-3 py-2.5 transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-on-surface">
                          {new Intl.DateTimeFormat(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: timezone,
                          }).format(new Date(reservation.start_at))}
                          <span className="font-mono font-normal text-on-surface-variant">
                            {" "}
                            · {formatBusinessTime(reservation.start_at, timezone)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                          {reservation.party_size} guests
                          {reservation.table
                            ? ` · ${reservation.table.area_name} · ${reservation.table.table_name}`
                            : ""}
                          {reservation.items?.length
                            ? ` · ${reservation.items.length} menu item${reservation.items.length === 1 ? "" : "s"}`
                            : ""}
                        </span>
                      </span>
                      <ReservationStatusBadge status={reservation.status} />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="border-t border-outline-variant pt-4">
          {confirmArchive ? (
            <div className="rounded-xl border border-error/30 bg-error/5 p-3">
              <p className="text-sm font-medium text-on-surface">
                Archive {customer.name}?
              </p>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                They’ll be hidden from this list and from booking search.
                Reservation history is kept.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  className="min-h-9"
                  disabled={busy === "archive"}
                  onClick={() => setConfirmArchive(false)}
                >
                  Keep
                </Button>
                <Button
                  variant="destructive"
                  className="min-h-9"
                  loading={busy === "archive"}
                  onClick={() => {
                    onArchive();
                    setConfirmArchive(false);
                  }}
                >
                  Archive
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmArchive(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-error hover:bg-error/10"
            >
              <Icon name="archive" size={16} />
              Archive customer
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
