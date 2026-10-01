"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerDetail } from "@/components/customers/customer-detail";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerList } from "@/components/customers/customer-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useBusinessContext } from "@/hooks/use-business-context";
import { useCustomerDetail } from "@/hooks/use-customer-detail";
import { useCustomerTags } from "@/hooks/use-customer-tags";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "@/hooks/use-debounce";
import {
  archiveCustomer,
  assignCustomerTag,
  createTag,
  getCustomer,
  unassignCustomerTag,
  updateCustomer,
} from "@/lib/api/customers";
import { cn } from "@/lib/cn";
import { customerErrorMessage } from "@/lib/customer-errors";
import {
  SEGMENTS,
  matchesSegment,
  statsOf,
  toNumber,
  type CustomerSegment,
} from "@/lib/customer-crm";
import { formatMenuPrice } from "@/lib/format-price";
import type { Customer, CustomerSort } from "@/types/customer";

const SORTS: Array<{ id: CustomerSort; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "last_visit", label: "Last visit" },
  { id: "spend", label: "Top spenders" },
  { id: "visits", label: "Most visits" },
  { id: "name", label: "Name A–Z" },
];

function Kpi({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-3.5 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-dark">
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
          {label}
        </p>
        <p className="truncate text-lg leading-tight font-semibold tabular-nums text-on-surface">
          {value}
        </p>
        <p className="truncate text-xs text-on-surface-variant">{hint}</p>
      </div>
    </div>
  );
}

export function CustomerWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("customer");

  const business = useBusinessContext();
  const currency = business.fnb?.currency || "IDR";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [sort, setSort] = useState<CustomerSort>("newest");
  const [tagId, setTagId] = useState("");
  const [segment, setSegment] = useState<CustomerSegment>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const list = useCustomers({
    search: debouncedSearch,
    sort,
    tagId,
    enabled: !business.loading,
  });
  const tagsResource = useCustomerTags();
  const detail = useCustomerDetail(selectedId);

  const visibleItems = useMemo(
    () => list.items.filter((item) => matchesSegment(item, segment)),
    [list.items, segment],
  );

  const segmentCounts = useMemo(() => {
    const counts = {} as Record<CustomerSegment, number>;
    for (const entry of SEGMENTS) {
      counts[entry.id] = list.items.filter((item) =>
        matchesSegment(item, entry.id),
      ).length;
    }
    return counts;
  }, [list.items]);

  const kpis = useMemo(() => {
    let revenue = 0;
    let repeat = 0;
    let upcoming = 0;
    for (const item of list.items) {
      const stats = statsOf(item);
      revenue += toNumber(stats.total_spent);
      if (stats.completed_count >= 2) {
        repeat += 1;
      }
      if (stats.next_reservation_at) {
        upcoming += 1;
      }
    }
    const total = list.items.length;
    return {
      total,
      revenue,
      repeat,
      repeatRate: total > 0 ? Math.round((repeat / total) * 100) : 0,
      upcoming,
    };
  }, [list.items]);

  const filtered = Boolean(debouncedSearch || tagId || segment !== "ALL");

  const selectCustomer = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("customer", id);
      router.replace(`/customers?${params.toString()}`, { scroll: false });
      setActionError("");
    },
    [router, searchParams],
  );

  const clearSelection = useCallback(() => {
    router.replace("/customers", { scroll: false });
    setActionError("");
  }, [router]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback(() => {
    if (!detail.customer) {
      return;
    }
    setEditing(detail.customer);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }, [detail.customer]);

  const syncCustomer = useCallback(
    (customer: Customer) => {
      list.upsertItem(customer);
      detail.setLocal(customer);
    },
    [detail, list],
  );

  const refreshSelected = useCallback(async () => {
    if (!selectedId) {
      return;
    }
    const fresh = await getCustomer(selectedId);
    syncCustomer(fresh);
  }, [selectedId, syncCustomer]);

  const handleSaved = useCallback(
    (customer: Customer) => {
      syncCustomer(customer);
      if (!editing) {
        selectCustomer(customer.id);
      }
    },
    [editing, selectCustomer, syncCustomer],
  );

  const handleArchive = useCallback(async () => {
    if (!selectedId) {
      return;
    }
    setBusy("archive");
    setActionError("");
    try {
      await archiveCustomer(selectedId);
      list.removeItem(selectedId);
      clearSelection();
    } catch (err) {
      setActionError(customerErrorMessage(err, "Couldn't archive customer."));
    } finally {
      setBusy(null);
    }
  }, [clearSelection, list, selectedId]);

  const handleAddTag = useCallback(
    async (name: string) => {
      if (!selectedId) {
        return;
      }
      setBusy("tag");
      setActionError("");
      try {
        const existing = tagsResource.tags.find(
          (tag) => tag.name.toLowerCase() === name.toLowerCase(),
        );
        let tag = existing;
        if (!tag) {
          tag = await createTag({ name });
          tagsResource.addTag(tag);
        }
        await assignCustomerTag(selectedId, tag.id);
        await refreshSelected();
      } catch (err) {
        setActionError(customerErrorMessage(err, "Couldn't add tag."));
      } finally {
        setBusy(null);
      }
    },
    [refreshSelected, selectedId, tagsResource],
  );

  const handleRemoveTag = useCallback(
    async (tagIdToRemove: string) => {
      if (!selectedId) {
        return;
      }
      setBusy("tag");
      setActionError("");
      try {
        await unassignCustomerTag(selectedId, tagIdToRemove);
        await refreshSelected();
      } catch (err) {
        setActionError(customerErrorMessage(err, "Couldn't remove tag."));
      } finally {
        setBusy(null);
      }
    },
    [refreshSelected, selectedId],
  );

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      if (!selectedId) {
        return;
      }
      setBusy("notes");
      setActionError("");
      try {
        const saved = await updateCustomer(selectedId, { notes });
        syncCustomer(saved);
      } catch (err) {
        setActionError(customerErrorMessage(err, "Couldn't save notes."));
      } finally {
        setBusy(null);
      }
    },
    [selectedId, syncCustomer],
  );

  const showMobileDetail = Boolean(selectedId);

  const detailPanel = (onBack?: () => void) => (
    <CustomerDetail
      customer={detail.customer}
      reservations={detail.reservations}
      allTags={tagsResource.tags}
      currency={currency}
      timezone={business.timezone}
      loading={detail.loading}
      error={detail.error}
      actionError={actionError}
      busy={busy}
      onBack={onBack}
      onEdit={openEdit}
      onArchive={() => void handleArchive()}
      onAddTag={(name) => void handleAddTag(name)}
      onRemoveTag={(id) => void handleRemoveTag(id)}
      onSaveNotes={(notes) => void handleSaveNotes(notes)}
      onRetry={detail.refetch}
    />
  );

  if (business.loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-24 w-full max-w-md animate-pulse rounded-2xl bg-surface-container-low" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
        <div className="min-w-0 lg:hidden">
          <h2 className="text-base font-semibold text-on-surface">Customers</h2>
          <p className="text-xs text-on-surface-variant">
            Know your guests, bring them back.
          </p>
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="text-sm text-on-surface-variant">
            Know your guests, bring them back.
          </p>
        </div>
        <Button className="ml-auto w-auto min-w-0 px-3 sm:px-4" onClick={openCreate}>
          <Icon name="person_add" size={18} />
          <span className="hidden sm:inline">Add customer</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5 xl:grid-cols-4">
        <Kpi
          icon="group"
          label="Customers"
          value={String(kpis.total)}
          hint={list.hasMore ? "Showing first page" : "In this view"}
        />
        <Kpi
          icon="payments"
          label="Lifetime value"
          value={formatMenuPrice(kpis.revenue, currency)}
          hint="From completed bookings"
        />
        <Kpi
          icon="repeat"
          label="Returning"
          value={`${kpis.repeatRate}%`}
          hint={`${kpis.repeat} guests with 2+ visits`}
        />
        <Kpi
          icon="event_upcoming"
          label="Upcoming"
          value={String(kpis.upcoming)}
          hint="Guests with a booking ahead"
        />
      </div>

      <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block min-w-52 flex-1">
            <span className="sr-only">Search customers</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
              <Icon name="search" size={18} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, or email"
              className="min-h-10 w-full rounded-xl border border-outline-variant bg-background py-2 pr-3 pl-10 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </label>

          <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant bg-background px-3 text-sm text-on-surface">
            <span className="text-on-surface-variant">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as CustomerSort)}
              className="bg-transparent font-medium outline-none"
              aria-label="Sort customers"
            >
              {SORTS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-outline-variant bg-background px-3 text-sm text-on-surface">
            <Icon name="label" size={16} className="text-on-surface-variant" />
            <select
              value={tagId}
              onChange={(event) => setTagId(event.target.value)}
              className="max-w-36 bg-transparent font-medium outline-none"
              aria-label="Filter by tag"
            >
              <option value="">All tags</option>
              {tagsResource.tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5"
          role="tablist"
          aria-label="Customer segments"
        >
          {SEGMENTS.map((entry) => {
            const active = segment === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSegment(entry.id)}
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-background text-on-surface hover:bg-surface-container-low",
                )}
              >
                {entry.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-surface-container-low text-on-surface-variant",
                  )}
                >
                  {segmentCounts[entry.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            "absolute inset-0 grid min-h-0 lg:grid-cols-[minmax(320px,1fr)_minmax(360px,1.15fr)]",
            showMobileDetail ? "max-lg:hidden" : "",
          )}
        >
          <section className="min-h-0 min-w-0 overflow-y-auto border-r border-outline-variant bg-background p-4">
            <CustomerList
              items={visibleItems}
              currency={currency}
              selectedId={selectedId}
              loading={list.loading}
              error={list.error}
              hasMore={list.hasMore}
              loadingMore={list.loadingMore}
              filtered={filtered}
              onSelect={selectCustomer}
              onLoadMore={() => void list.loadMore()}
              onRetry={() => void list.refetch()}
              onCreate={openCreate}
            />
          </section>

          <section className="hidden min-h-0 min-w-0 overflow-hidden bg-surface lg:block">
            {detailPanel()}
          </section>
        </div>

        <div
          className={cn(
            "absolute inset-0 bg-surface lg:hidden",
            showMobileDetail ? "block" : "hidden",
          )}
        >
          {detailPanel(clearSelection)}
        </div>
      </div>

      <CustomerForm
        key={`customer-form-${formKey}`}
        open={formOpen}
        customer={editing}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
