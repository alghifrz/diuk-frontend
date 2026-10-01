import {
  PREVIEW_CUSTOMER_NAME,
  PREVIEW_CUSTOMER_NOTE,
} from "@/lib/ai-preview-sandbox";
import type { Customer, CustomerStats } from "@/types/customer";

export type CustomerStage = "VIP" | "REPEAT" | "FIRST_VISIT" | "PROSPECT" | "LAPSED";

export type CustomerSegment = "ALL" | "VIP" | "REPEAT" | "NEW" | "LAPSED" | "UPCOMING";

export const VIP_MIN_VISITS = 5;
export const REPEAT_MIN_VISITS = 2;
export const LAPSED_AFTER_DAYS = 60;

/** The internal "Try it" sandbox contact from /prompt — not a real guest. */
export function isSandboxCustomer(customer: Customer) {
  return (
    customer.name === PREVIEW_CUSTOMER_NAME &&
    (customer.notes ?? "").trim() === PREVIEW_CUSTOMER_NOTE
  );
}

export const EMPTY_STATS: CustomerStats = {
  reservation_count: 0,
  completed_count: 0,
  cancelled_count: 0,
  total_spent: 0,
  last_visit_at: null,
  next_reservation_at: null,
};

export function statsOf(customer: Customer): CustomerStats {
  return customer.stats ?? EMPTY_STATS;
}

export function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function daysSince(iso: string | null, now = Date.now()) {
  if (!iso) {
    return null;
  }
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) {
    return null;
  }
  return Math.floor((now - time) / 86_400_000);
}

export function isLapsed(customer: Customer, now = Date.now()) {
  const stats = statsOf(customer);
  if (stats.completed_count < 1 || stats.next_reservation_at) {
    return false;
  }
  const days = daysSince(stats.last_visit_at, now);
  return days !== null && days >= LAPSED_AFTER_DAYS;
}

export function customerStage(customer: Customer, now = Date.now()): CustomerStage {
  const stats = statsOf(customer);
  if (stats.completed_count >= VIP_MIN_VISITS) {
    return "VIP";
  }
  if (isLapsed(customer, now)) {
    return "LAPSED";
  }
  if (stats.completed_count >= REPEAT_MIN_VISITS) {
    return "REPEAT";
  }
  if (stats.completed_count === 1) {
    return "FIRST_VISIT";
  }
  return "PROSPECT";
}

export const STAGE_LABEL: Record<CustomerStage, string> = {
  VIP: "VIP",
  REPEAT: "Regular",
  FIRST_VISIT: "First visit",
  PROSPECT: "Prospect",
  LAPSED: "Lapsed",
};

export const STAGE_STYLE: Record<CustomerStage, string> = {
  VIP: "bg-secondary/10 text-secondary ring-secondary/25",
  REPEAT: "bg-success/15 text-success ring-success/30",
  FIRST_VISIT: "bg-info/15 text-info ring-info/30",
  PROSPECT: "bg-surface-container-low text-on-surface-variant ring-outline-variant",
  LAPSED: "bg-warning/15 text-warning ring-warning/30",
};

export const SEGMENTS: Array<{ id: CustomerSegment; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "VIP", label: "VIP" },
  { id: "REPEAT", label: "Regulars" },
  { id: "NEW", label: "New" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "LAPSED", label: "Lapsed" },
];

export function matchesSegment(
  customer: Customer,
  segment: CustomerSegment,
  now = Date.now(),
) {
  if (segment === "ALL") {
    return true;
  }
  const stage = customerStage(customer, now);
  const stats = statsOf(customer);
  switch (segment) {
    case "VIP":
      return stage === "VIP";
    case "REPEAT":
      return stage === "REPEAT" || stage === "VIP";
    case "NEW":
      return stage === "FIRST_VISIT" || stage === "PROSPECT";
    case "UPCOMING":
      return Boolean(stats.next_reservation_at);
    case "LAPSED":
      return stage === "LAPSED";
    default:
      return true;
  }
}

export function averageSpend(customer: Customer) {
  const stats = statsOf(customer);
  if (stats.completed_count < 1) {
    return 0;
  }
  return toNumber(stats.total_spent) / stats.completed_count;
}

export function formatRelativeDay(iso: string | null, now = Date.now()) {
  if (!iso) {
    return "—";
  }
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) {
    return "—";
  }
  const diffDays = Math.round((time - now) / 86_400_000);
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  if (diffDays === -1) {
    return "Yesterday";
  }
  if (diffDays > 1 && diffDays < 31) {
    return `In ${diffDays} days`;
  }
  if (diffDays < -1 && diffDays > -31) {
    return `${Math.abs(diffDays)} days ago`;
  }
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(time);
}

export function customerContactLine(customer: Customer) {
  return customer.phone || customer.email || "No contact info";
}

export function whatsappLink(customer: Customer) {
  const identity = customer.identities?.find(
    (item) => item.channel === "WHATSAPP" && item.status === "ACTIVE",
  );
  const raw = identity?.external_id || customer.phone || "";
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 6 ? `https://wa.me/${digits}` : null;
}
