"use client";

import Link from "next/link";
import { useState } from "react";
import { MotionConfig, motion } from "motion/react";
import {
  AnimatedNumber,
  MotionLink,
  Stagger,
  revealOnView,
  riseItem,
  slideItem,
  staggerContainer,
} from "@/components/dashboard/motion-kit";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ReservationStatusBadge } from "@/components/reservations/status-badge";
import { Icon } from "@/components/ui/icon";
import { useDashboardOverview } from "@/hooks/use-dashboard-overview";
import {
  formatBusinessDateLabel,
  formatBusinessTime,
} from "@/lib/business-time";
import { cn } from "@/lib/cn";
import { formatMenuPrice } from "@/lib/format-price";
import type { CurrentUser } from "@/types/user";
import type { CalendarDayEvent, Reservation } from "@/types/reservation";
import type { Conversation } from "@/types/chat";
import type { MenuItem } from "@/types/menu";

type DashboardWorkspaceProps = {
  user: CurrentUser;
};

function firstName(user: CurrentUser) {
  const source = user.name?.trim() || user.email?.split("@")[0] || "there";
  return source.split(/\s+/)[0];
}

function greetingLabel(timeZone: string, now = new Date()) {
  const hourPart = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  })
    .formatToParts(now)
    .find((part) => part.type === "hour")?.value;
  const hour = Number(hourPart ?? "12");
  if (hour < 11) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function hoursLabel(
  hours: Array<{ open_time: string; close_time: string }>,
  closed: boolean,
) {
  if (closed) return "Closed today";
  if (!hours.length) return "Hours not set";
  const first = hours[0];
  const last = hours[hours.length - 1];
  return `Open ${first.open_time.slice(0, 5)} – ${last.close_time.slice(0, 5)}`;
}

export function DashboardWorkspace({ user }: DashboardWorkspaceProps) {
  const { overview, stats, loading, error, refetch } = useDashboardOverview();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }
  const timezone = overview?.timezone || "UTC";
  const businessName = overview?.profile?.name?.trim() || "Your workspace";
  const todayLabel = overview
    ? formatBusinessDateLabel(overview.today, timezone)
    : "";

  const upcoming = (overview?.reservationsToday ?? [])
    .filter((item) => item.status === "PENDING" || item.status === "CONFIRMED")
    .sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    )
    .slice(0, 6);

  const attentionReservations = (overview?.reservationsToday ?? [])
    .filter((item) => item.status === "PENDING")
    .sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    )
    .slice(0, 4);

  const attentionChats = (overview?.humanRequested ?? []).slice(0, 4);

  const scheduleEvents = (overview?.calendar?.events ?? [])
    .filter((event) => event.type === "RESERVATION" || event.reservation_id)
    .sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    )
    .slice(0, 8);

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--color-primary)_22%,transparent)_0%,transparent_55%),radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--color-secondary)_18%,transparent)_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--color-outline-variant)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--color-outline-variant)_55%,transparent)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8">
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-secondary text-white shadow-[0_24px_60px_-28px_rgba(32,38,92,0.55)]"
        >
          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            <motion.div
              aria-hidden
              animate={{ x: [0, -24, 0], y: [0, 18, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary/25 blur-3xl"
            />
            <motion.div
              aria-hidden
              animate={{ x: [0, 28, 0], y: [0, -16, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -bottom-28 left-10 size-64 rounded-full bg-success/15 blur-3xl"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary-light backdrop-blur-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  Live workspace
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {greetingLabel(timezone)}, {firstName(user)}
                </h2>
                <p className="mt-2 text-base text-white/70 sm:text-lg">
                  {businessName}
                  {todayLabel ? (
                    <>
                      <span className="mx-2 text-white/35">·</span>
                      {todayLabel}
                    </>
                  ) : null}
                </p>
                <p className="mt-3 text-sm text-white/55">
                  {loading && !overview
                    ? "Loading today’s pulse…"
                    : hoursLabel(stats.hours, stats.closed)}
                  <span className="mx-2 text-white/25">·</span>
                  {timezone}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <MotionLink
                  href="/chat"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                >
                  <Icon name="chat" size={18} />
                  Open inbox
                </MotionLink>
                <MotionLink
                  href="/reservations"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                >
                  <Icon name="event" size={18} />
                  Reservations
                </MotionLink>
                <motion.button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={refreshing}
                  aria-label="Refresh dashboard"
                  title="Refresh"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="inline-flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light disabled:opacity-70"
                >
                  <motion.span
                    animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      refreshing
                        ? { duration: 0.9, repeat: Infinity, ease: "linear" }
                        : { duration: 0.3 }
                    }
                    className="inline-flex"
                  >
                    <Icon name="refresh" size={18} />
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg px-3 py-1.5 font-medium underline-offset-2 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        <Stagger
          delay={0.15}
          stagger={0.08}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          role="group"
          aria-label="Today at a glance"
        >
          <StatTile
            label="Today’s bookings"
            value={stats.todayTotal}
            hint={`${stats.confirmed} confirmed · ${stats.pending} pending`}
            icon="event_available"
            tone="primary"
            href="/reservations"
            loading={loading && !overview}
          />
          <StatTile
            label="Needs confirm"
            value={stats.pending}
            hint="Pending reservations today"
            icon="pending_actions"
            tone="warning"
            href="/reservations"
            loading={loading && !overview}
          />
          <StatTile
            label="Unread chats"
            value={stats.unreadMessages}
            hint="Messages waiting in inbox"
            icon="mark_chat_unread"
            tone="info"
            href="/chat"
            loading={loading && !overview}
          />
          <StatTile
            label="Human handoff"
            value={stats.humanRequested}
            hint="Customers waiting for staff"
            icon="support_agent"
            tone="secondary"
            href="/chat"
            loading={loading && !overview}
          />
        </Stagger>

        <motion.section
          {...revealOnView(0.05)}
          className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
                Revenue
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
                Revenue from full payments
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Counted when a booking is paid in full (including balances recorded with Pay in full). Deposits alone are not counted yet.
              </p>
            </div>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition hover:text-secondary-dark"
            >
              Open reservations
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {loading && !overview ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`rev-skel-${index}`}
                  className="h-28 animate-pulse rounded-2xl bg-surface-container-low"
                />
              ))}
            </div>
          ) : overview?.revenueToday || overview?.revenueMonth ? (
            <>
              <Stagger className="mt-5 grid gap-3 sm:grid-cols-3" delay={0.1}>
                <RevenueMetric
                  label="Revenue today"
                  amount={stats.revenueTodayCollected}
                  currency={stats.currency}
                  hint={`${stats.revenueTodayPaidCount} paid · ${stats.revenueTodayUnpaidCount} unpaid`}
                  tone="primary"
                />
                <RevenueMetric
                  label="Revenue this month"
                  amount={stats.revenueMonthCollected}
                  currency={stats.currency}
                  hint={`${stats.revenueMonthPaidCount} collected payments`}
                  tone="secondary"
                />
                <RevenueMetric
                  label="Outstanding"
                  amount={stats.revenueMonthOutstanding}
                  currency={stats.currency}
                  hint={`${Math.round((stats.revenueCollectionRate || 0) * 100)}% collection rate`}
                  tone="warning"
                />
              </Stagger>

              {(stats.revenueSeries?.length ?? 0) > 0 ? (
                <RevenueChart
                  series={stats.revenueSeries}
                  currency={stats.currency}
                />
              ) : null}
            </>
          ) : (
            <EmptyBlock
              icon="payments"
              title="No full payments yet"
              body="Once a booking is paid in full, its payment shows up here."
              actionHref="/reservations"
              actionLabel="View reservations"
            />
          )}
        </motion.section>

        <motion.section
          {...revealOnView(0.05)}
          className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] backdrop-blur-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
                  Schedule
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
                  Today’s floor
                </h3>
              </div>
              <Link
                href="/reservations"
                className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition hover:text-secondary-dark"
              >
                View all
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>

            {loading && !overview ? (
              <ScheduleSkeleton />
            ) : scheduleEvents.length > 0 ? (
              <motion.ol
                className="mt-5 space-y-0"
                variants={staggerContainer(0.06)}
                initial="hidden"
                animate="show"
              >
                {scheduleEvents.map((event, index) => (
                  <ScheduleRow
                    key={event.id}
                    event={event}
                    timezone={timezone}
                    isLast={index === scheduleEvents.length - 1}
                  />
                ))}
              </motion.ol>
            ) : upcoming.length > 0 ? (
              <motion.ol
                className="mt-5 space-y-0"
                variants={staggerContainer(0.06)}
                initial="hidden"
                animate="show"
              >
                {upcoming.map((item, index) => (
                  <ReservationRow
                    key={item.id}
                    reservation={item}
                    timezone={timezone}
                    isLast={index === upcoming.length - 1}
                  />
                ))}
              </motion.ol>
            ) : (
              <EmptyBlock
                icon="calendar_month"
                title="No bookings on the board"
                body="When customers reserve for today, they will appear here."
                actionHref="/reservations"
                actionLabel="Open reservations"
              />
            )}
          </div>

          <div className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] backdrop-blur-sm sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
              Attention
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
              Needs you
            </h3>

            {loading && !overview ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`attention-skel-${index}`}
                    className="h-16 animate-pulse rounded-xl bg-surface-container-low"
                  />
                ))}
              </div>
            ) : attentionReservations.length === 0 &&
              attentionChats.length === 0 ? (
              <EmptyBlock
                icon="verified"
                title="You’re clear"
                body="No pending bookings or handoffs waiting right now."
              />
            ) : (
              <Stagger className="mt-5 space-y-3" stagger={0.07}>
                {attentionReservations.map((item) => (
                  <MotionLink
                    key={item.id}
                    variants={riseItem}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    href={`/reservations?date=${overview?.today ?? ""}&reservation=${item.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-outline-variant bg-background/70 px-3 py-3 transition hover:border-primary/40 hover:bg-surface-container-low"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                      <Icon name="event" size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-on-surface">
                        {item.customer.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-on-surface-variant">
                        {formatBusinessTime(item.start_at, timezone)} ·{" "}
                        {item.party_size} guests · pending
                      </span>
                    </span>
                    <Icon
                      name="chevron_right"
                      size={18}
                      className="text-outline transition group-hover:text-on-surface"
                    />
                  </MotionLink>
                ))}
                {attentionChats.map((chat) => (
                  <HandoffRow key={chat.id} conversation={chat} />
                ))}
              </Stagger>
            )}
          </div>
        </motion.section>

        <motion.section
          {...revealOnView(0.05)}
          className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] backdrop-blur-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
                Menu
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
                Newly added
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Latest items from your menu, ready for AI and guests.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition hover:text-secondary-dark"
            >
              Manage menu
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {loading && !overview ? (
            <div className="mt-5 flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`menu-skel-${index}`}
                  className="h-44 w-40 shrink-0 animate-pulse rounded-2xl bg-surface-container-low"
                />
              ))}
            </div>
          ) : (overview?.recentMenuItems?.length ?? 0) > 0 ? (
            <motion.ul
              className="mt-5 flex gap-3 overflow-x-auto pb-2"
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="show"
            >
              {(overview?.recentMenuItems ?? []).map((item, index) => (
                <motion.li
                  key={item.id}
                  variants={riseItem}
                  className="shrink-0"
                >
                  <RecentMenuCard
                    item={item}
                    currency={overview?.fnb?.currency || "IDR"}
                    timezone={timezone}
                    priority={index < 2}
                  />
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <EmptyBlock
              icon="restaurant_menu"
              title="No menu items yet"
              body="Add dishes so the AI can answer price and menu questions."
              actionHref="/menu"
              actionLabel="Add menu item"
            />
          )}
        </motion.section>

        <motion.section
          {...revealOnView(0.05)}
          className="grid gap-4 lg:grid-cols-[1.2fr_1fr]"
        >
          <div className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
              Jump in
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
              Keep the floor moving
            </h3>
            <Stagger inView className="mt-5 grid gap-3 sm:grid-cols-2">
              <ShortcutCard
                href="/chat"
                icon="forum"
                title="Inbox"
                description="Reply, take over, and resolve chats."
              />
              <ShortcutCard
                href="/reservations"
                icon="table_restaurant"
                title="Reservations"
                description="Confirm pending and clear finished tables."
              />
              <ShortcutCard
                href="/menu"
                icon="restaurant_menu"
                title="Menu"
                description="Keep prices and items ready for AI."
              />
              <ShortcutCard
                href="/prompt"
                icon="psychology"
                title="AI Assistant"
                description="Tune prompts and try conversations."
              />
            </Stagger>
          </div>

          <div className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
              System
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
              Ready to serve
            </h3>
            <motion.ul
              className="mt-5 space-y-3"
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <StatusRow
                label="WhatsApp"
                ok={stats.whatsappActive}
                detail={
                  !stats.whatsappConnected
                    ? "Not connected"
                    : stats.whatsappActive
                      ? "Channel active"
                      : "Channel inactive"
                }
                href="/settings"
              />
              <StatusRow
                label="AI replies"
                ok={stats.aiEnabled && stats.hasLivePrompt}
                detail={
                  !stats.aiEnabled
                    ? "AI disabled"
                    : stats.hasLivePrompt
                      ? `Live · ${overview?.activePrompt?.name ?? "prompt"} v${overview?.activePrompt?.version ?? "—"}`
                      : "No live prompt"
                }
                href="/prompt"
              />
              <StatusRow
                label="Reservations"
                ok={stats.reservationsEnabled}
                detail={
                  stats.reservationsEnabled
                    ? "Booking window open"
                    : "Booking disabled"
                }
                href="/settings"
              />
            </motion.ul>
          </div>
        </motion.section>
      </div>
    </div>
    </MotionConfig>
  );
}

function parseAmount(raw: number | string) {
  return typeof raw === "number"
    ? raw
    : Number(String(raw).replace(/,/g, "")) || 0;
}

function RevenueMetric({
  label,
  amount,
  currency,
  hint,
  tone,
}: {
  label: string;
  amount: number | string;
  currency: string;
  hint: string;
  tone: "primary" | "secondary" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary/15 text-primary-dark",
    secondary: "bg-secondary/10 text-secondary",
    warning: "bg-warning/15 text-warning",
  }[tone];

  return (
    <motion.div
      variants={riseItem}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="rounded-2xl border border-outline-variant bg-background/70 p-4 transition-shadow hover:shadow-[0_16px_36px_-26px_rgba(30,36,48,0.45)]"
    >
      <motion.span
        whileHover={{ rotate: -8, scale: 1.1 }}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-xl",
          toneClass,
        )}
      >
        <Icon name="payments" size={18} />
      </motion.span>
      <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-on-surface-variant uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-on-surface tabular-nums">
        <AnimatedNumber
          value={parseAmount(amount)}
          format={(n) => formatMenuPrice(Math.round(n), currency)}
        />
      </p>
      <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>
    </motion.div>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon,
  tone,
  href,
  loading,
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
  tone: "primary" | "warning" | "info" | "secondary";
  href: string;
  loading?: boolean;
}) {
  const toneClass = {
    primary: "bg-primary/15 text-primary-dark",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/15 text-info",
    secondary: "bg-secondary/10 text-secondary",
  }[tone];

  return (
    <MotionLink
      href={href}
      variants={riseItem}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="group rounded-[1.35rem] border border-outline-variant bg-surface/90 p-4 shadow-[0_10px_30px_-24px_rgba(30,36,48,0.4)] transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-[0_18px_40px_-24px_rgba(101,147,58,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <motion.span
          whileHover={{ rotate: -10, scale: 1.12 }}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            toneClass,
          )}
        >
          <Icon name={icon} size={20} />
        </motion.span>
        <Icon
          name="north_east"
          size={16}
          className="text-outline opacity-0 transition group-hover:opacity-100"
        />
      </div>
      <p className="mt-4 font-mono text-[10px] tracking-[0.14em] text-on-surface-variant uppercase">
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-9 w-16 animate-pulse rounded-lg bg-surface-container-low" />
      ) : (
        <p className="mt-1 text-3xl font-semibold tracking-tight text-on-surface tabular-nums">
          <AnimatedNumber value={value} />
        </p>
      )}
      <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>
    </MotionLink>
  );
}

function ScheduleRow({
  event,
  timezone,
  isLast,
}: {
  event: CalendarDayEvent;
  timezone: string;
  isLast: boolean;
}) {
  return (
    <motion.li
      variants={slideItem}
      className="relative flex gap-3 pb-4 last:pb-0"
    >
      {!isLast ? (
        <span
          aria-hidden
          className="absolute top-8 bottom-0 left-[15px] w-px bg-outline-variant"
        />
      ) : null}
      <span className="relative z-[1] mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-[11px] font-semibold text-secondary">
        {formatBusinessTime(event.start_at, timezone).slice(0, 2)}
      </span>
      <MotionLink
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        href={
          event.reservation_id
            ? `/reservations?reservation=${event.reservation_id}`
            : "/reservations"
        }
        className="min-w-0 flex-1 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-outline-variant hover:bg-background"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-on-surface">
            {event.customer || event.title}
          </p>
          <ReservationStatusBadge status={event.status} />
        </div>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {formatBusinessTime(event.start_at, timezone)}
          {event.party_size ? ` · ${event.party_size} guests` : ""}
          {event.area ? ` · ${event.area}` : ""}
          {event.table ? ` · ${event.table}` : ""}
        </p>
      </MotionLink>
    </motion.li>
  );
}

function ReservationRow({
  reservation,
  timezone,
  isLast,
}: {
  reservation: Reservation;
  timezone: string;
  isLast: boolean;
}) {
  return (
    <motion.li
      variants={slideItem}
      className="relative flex gap-3 pb-4 last:pb-0"
    >
      {!isLast ? (
        <span
          aria-hidden
          className="absolute top-8 bottom-0 left-[15px] w-px bg-outline-variant"
        />
      ) : null}
      <span className="relative z-[1] mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-[11px] font-semibold text-secondary">
        {formatBusinessTime(reservation.start_at, timezone).slice(0, 2)}
      </span>
      <MotionLink
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        href={`/reservations?reservation=${reservation.id}`}
        className="min-w-0 flex-1 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-outline-variant hover:bg-background"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-on-surface">
            {reservation.customer.name}
          </p>
          <ReservationStatusBadge status={reservation.status} />
        </div>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {formatBusinessTime(reservation.start_at, timezone)} ·{" "}
          {reservation.party_size} guests
          {reservation.table?.area_name
            ? ` · ${reservation.table.area_name}`
            : ""}
        </p>
      </MotionLink>
    </motion.li>
  );
}

function HandoffRow({ conversation }: { conversation: Conversation }) {
  return (
    <MotionLink
      variants={riseItem}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      href={`/chat?conversation=${conversation.id}`}
      className="group flex items-center gap-3 rounded-xl border border-outline-variant bg-background/70 px-3 py-3 transition hover:border-secondary/35 hover:bg-surface-container-low"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
        <Icon name="support_agent" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-on-surface">
          {conversation.customer.name}
        </span>
        <span className="mt-0.5 block text-xs text-on-surface-variant">
          Needs human · {conversation.channel.toLowerCase()}
        </span>
      </span>
      <Icon
        name="chevron_right"
        size={18}
        className="text-outline transition group-hover:text-on-surface"
      />
    </MotionLink>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <MotionLink
      href={href}
      variants={riseItem}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="group flex gap-3 rounded-2xl border border-outline-variant bg-background/60 p-4 transition-colors hover:border-primary/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <motion.span
        whileHover={{ rotate: -8, scale: 1.08 }}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white transition-colors group-hover:bg-secondary-dark"
      >
        <Icon name={icon} size={20} />
      </motion.span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-on-surface">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-on-surface-variant">
          {description}
        </span>
      </span>
    </MotionLink>
  );
}

function StatusRow({
  label,
  ok,
  detail,
  href,
}: {
  label: string;
  ok: boolean;
  detail: string;
  href: string;
}) {
  return (
    <motion.li variants={slideItem}>
      <MotionLink
        href={href}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="flex items-center gap-3 rounded-xl border border-outline-variant px-3 py-3 transition-colors hover:bg-background"
      >
        <span className="relative flex size-2.5 shrink-0">
          {ok ? (
            <motion.span
              aria-hidden
              animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              className="absolute inline-flex size-full rounded-full bg-success"
            />
          ) : null}
          <span
            className={cn(
              "relative inline-flex size-2.5 rounded-full",
              ok ? "bg-success" : "bg-warning",
            )}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-on-surface">
            {label}
          </span>
          <span className="block truncate text-xs text-on-surface-variant">
            {detail}
          </span>
        </span>
        <Icon name="chevron_right" size={18} className="text-outline" />
      </MotionLink>
    </motion.li>
  );
}

function RecentMenuCard({
  item,
  currency,
  timezone,
  priority = false,
}: {
  item: MenuItem;
  currency: string;
  timezone: string;
  priority?: boolean;
}) {
  return (
    <MotionLink
      href="/menu"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="group flex w-40 flex-col overflow-hidden rounded-2xl border border-outline-variant bg-background/70 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-28 overflow-hidden bg-surface-container-low">
        {item.image_url ? (
          // Signed URLs expire; avoid Next/Image remote config binding.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={320}
            height={224}
          />
        ) : (
          <div
            className="flex size-full items-center justify-center text-on-surface-variant"
            aria-hidden
          >
            <Icon name="restaurant" size={22} />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-secondary/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
          New
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-on-surface">
          {item.name}
        </p>
        <p className="truncate text-[11px] text-on-surface-variant">
          {item.category_name}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-sm font-semibold tabular-nums text-on-surface">
            {formatMenuPrice(item.price, currency)}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {relativeAddedLabel(item.created_at, timezone)}
          </p>
        </div>
      </div>
    </MotionLink>
  );
}

function relativeAddedLabel(iso: string, timeZone: string) {
  const created = new Date(iso).getTime();
  if (!Number.isFinite(created)) return "";
  const now = Date.now();
  const diffDays = Math.floor((now - created) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatBusinessDateLabel(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso)),
    timeZone,
  );
}

function EmptyBlock({
  icon,
  title,
  body,
  actionHref,
  actionLabel,
}: {
  icon: string;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 rounded-2xl border border-dashed border-outline-variant bg-background/50 px-4 py-8 text-center"
    >
      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-container-low text-secondary"
      >
        <Icon name={icon} size={22} />
      </motion.span>
      <p className="mt-3 text-sm font-semibold text-on-surface">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-on-surface-variant">
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex text-sm font-medium text-secondary hover:text-secondary-dark"
        >
          {actionLabel}
        </Link>
      ) : null}
    </motion.div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`schedule-skel-${index}`}
          className="flex gap-3"
        >
          <div className="size-8 animate-pulse rounded-full bg-surface-container-low" />
          <div className="h-14 flex-1 animate-pulse rounded-xl bg-surface-container-low" />
        </div>
      ))}
    </div>
  );
}
