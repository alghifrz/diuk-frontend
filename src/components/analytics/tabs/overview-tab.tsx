"use client";

import { useMemo } from "react";
import { BarChart, StackedBars } from "@/components/analytics/charts";
import {
  ExportButton,
  Insights,
  Panel,
  ReportState,
  Skeleton,
  StatCard,
  StatGrid,
} from "@/components/analytics/primitives";
import type { TabProps } from "@/components/analytics/tab-props";
import { useReport } from "@/hooks/use-analytics-report";
import {
  WEEKDAYS_LONG,
  deltaPct,
  fillDays,
  fmtInt,
  fmtPct,
  hourLabel,
  ratio,
  shortDay,
  toNum,
} from "@/lib/analytics-report";
import { formatMenuPrice } from "@/lib/format-price";

export function OverviewTab({ range, previous, currency, rangeSlug }: TabProps) {
  const overview = useReport("overview", range);
  const prevOverview = useReport("overview", previous);
  const revenue = useReport("revenue", range);
  const prevRevenue = useReport("revenue", previous);
  const reservations = useReport("reservations", range);

  const money = (value: number) => formatMenuPrice(Math.round(value), currency);

  const revenueDays = useMemo(
    () =>
      fillDays(range, revenue.data?.series, (date) => ({
        date,
        payment_records: 0,
        paid_count: 0,
        total_amount: 0,
        paid_amount: 0,
      })),
    [range, revenue.data],
  );

  const reservationDays = useMemo(
    () =>
      fillDays(range, reservations.data?.series, (date) => ({
        date,
        reservations: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
      })),
    [range, reservations.data],
  );

  const insights = useMemo(() => {
    const notes: string[] = [];
    const data = reservations.data?.summary;
    if (data && data.total > 0) {
      const hours = [...data.by_hour].sort(
        (a, b) => b.reservation_count - a.reservation_count,
      );
      const days = [...data.by_weekday].sort(
        (a, b) => b.reservation_count - a.reservation_count,
      );
      if (hours[0]?.reservation_count > 0) {
        notes.push(
          `Peak booking hour is ${hourLabel(hours[0].hour)} (${fmtInt(hours[0].reservation_count)} reservations).`,
        );
      }
      if (days[0]?.reservation_count > 0) {
        notes.push(
          `${WEEKDAYS_LONG[days[0].day_of_week] ?? "—"} is your busiest day of the week.`,
        );
      }
      if (data.cancellation_rate >= 0.2) {
        notes.push(
          `${fmtPct(data.cancellation_rate)} of reservations were cancelled — worth reviewing deposits or reminders.`,
        );
      }
      const area = [...data.by_area].sort(
        (a, b) => b.reservation_count - a.reservation_count,
      )[0];
      if (area && area.reservation_count > 0) {
        notes.push(`${area.area_name} is the most requested area.`);
      }
    }
    const rev = revenue.data?.summary;
    if (rev && toNum(rev.unpaid_amount) > 0) {
      notes.push(
        `${money(toNum(rev.unpaid_amount))} is still awaiting payment.`,
      );
    }
    return notes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations.data, revenue.data, currency]);

  const exportRows = useMemo(() => {
    const o = overview.data?.summary;
    const r = revenue.data?.summary;
    if (!o || !r) return [];
    return [
      ["Period", `${range.from} to ${range.to}`],
      [],
      ["Metric", "Value"],
      ["Revenue collected", toNum(r.paid_amount)],
      ["Reservations", o.total_reservations],
      ["Completed", o.completed_reservations],
      ["Cancelled", o.cancelled_reservations],
      ["New customers", o.new_customers],
      ["Conversations", o.total_conversations],
      ["AI replies", o.ai_generated_messages],
      ["Human replies", o.human_messages],
      [],
      ["Date", "Revenue collected", "Reservations", "Completed", "Cancelled"],
      ...revenueDays.map((day, i) => [
        day.date,
        toNum(day.paid_amount),
        reservationDays[i]?.reservations ?? 0,
        reservationDays[i]?.completed ?? 0,
        reservationDays[i]?.cancelled ?? 0,
      ]),
    ];
  }, [overview.data, revenue.data, revenueDays, reservationDays, range]);

  const kpiSkeleton = (
    <StatGrid>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </StatGrid>
  );

  return (
    <div className="space-y-5">
      <ReportState resource={overview} skeleton={kpiSkeleton}>
        {(o) => {
          const s = o.summary;
          const p = prevOverview.data?.summary;
          const rev = revenue.data?.summary;
          const prevRev = prevRevenue.data?.summary;
          const paid = rev ? toNum(rev.paid_amount) : 0;
          const avgPayment = rev && rev.paid_count > 0 ? paid / rev.paid_count : 0;
          const aiShare = ratio(
            s.ai_generated_messages,
            s.ai_generated_messages + s.human_messages,
          );
          return (
            <StatGrid>
              <StatCard
                icon="payments"
                label="Revenue collected"
                value={rev ? money(paid) : "…"}
                hint={rev ? `${fmtInt(rev.paid_count)} paid orders` : undefined}
                delta={
                  rev && prevRev
                    ? deltaPct(paid, toNum(prevRev.paid_amount))
                    : undefined
                }
              />
              <StatCard
                icon="event"
                label="Reservations"
                value={fmtInt(s.total_reservations)}
                hint={`${fmtInt(s.confirmed_reservations)} confirmed upcoming`}
                delta={p ? deltaPct(s.total_reservations, p.total_reservations) : undefined}
                tone="secondary"
              />
              <StatCard
                icon="task_alt"
                label="Completed visits"
                value={fmtInt(s.completed_reservations)}
                hint={`${fmtPct(ratio(s.completed_reservations, s.total_reservations))} of bookings`}
                delta={
                  p ? deltaPct(s.completed_reservations, p.completed_reservations) : undefined
                }
                tone="success"
              />
              <StatCard
                icon="event_busy"
                label="Cancellations"
                value={fmtInt(s.cancelled_reservations)}
                hint={`${fmtPct(ratio(s.cancelled_reservations, s.total_reservations))} of bookings`}
                delta={
                  p ? deltaPct(s.cancelled_reservations, p.cancelled_reservations) : undefined
                }
                invertDelta
                tone="error"
              />
              <StatCard
                icon="person_add"
                label="New guests"
                value={fmtInt(s.new_customers)}
                hint={`${fmtInt(s.total_customers)} guests total`}
                delta={p ? deltaPct(s.new_customers, p.new_customers) : undefined}
                tone="info"
              />
              <StatCard
                icon="chat"
                label="Conversations"
                value={fmtInt(s.total_conversations)}
                hint={`${fmtInt(s.inbound_messages)} messages received`}
                delta={
                  p ? deltaPct(s.total_conversations, p.total_conversations) : undefined
                }
                tone="info"
              />
              <StatCard
                icon="psychology"
                label="AI share of replies"
                value={fmtPct(aiShare)}
                hint={`${fmtInt(s.ai_generated_messages)} AI · ${fmtInt(s.human_messages)} human`}
                tone="secondary"
              />
              <StatCard
                icon="receipt_long"
                label="Avg. payment"
                value={rev ? money(avgPayment) : "…"}
                hint="Per paid order"
                delta={
                  rev && prevRev && prevRev.paid_count > 0
                    ? deltaPct(avgPayment, toNum(prevRev.paid_amount) / prevRev.paid_count)
                    : undefined
                }
              />
            </StatGrid>
          );
        }}
      </ReportState>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Revenue collected"
          subtitle="Fully paid orders, by day"
          action={<ExportButton filename={`diuk-overview-${rangeSlug}.csv`} rows={exportRows} />}
        >
          <ReportState resource={revenue} skeleton={<Skeleton className="h-52" />}>
            {() => (
              <BarChart
                data={revenueDays.map((day) => ({
                  label: shortDay(day.date),
                  axis: shortDay(day.date),
                  value: toNum(day.paid_amount),
                }))}
                format={money}
              />
            )}
          </ReportState>
        </Panel>

        <Panel title="Reservations" subtitle="By status, per day">
          <ReportState resource={reservations} skeleton={<Skeleton className="h-52" />}>
            {() => (
              <StackedBars
                data={reservationDays.map((day) => ({
                  label: shortDay(day.date),
                  axis: shortDay(day.date),
                  parts: [
                    day.completed,
                    day.confirmed,
                    Math.max(
                      0,
                      day.reservations - day.completed - day.confirmed - day.cancelled,
                    ),
                    day.cancelled,
                  ],
                }))}
                series={[
                  { label: "Completed", tone: "success" },
                  { label: "Confirmed", tone: "primary" },
                  { label: "Pending", tone: "warning" },
                  { label: "Cancelled", tone: "error" },
                ]}
              />
            )}
          </ReportState>
        </Panel>
      </div>

      {insights.length > 0 ? (
        <Panel title="Highlights" subtitle="What stands out in this period">
          <Insights items={insights} />
        </Panel>
      ) : null}
    </div>
  );
}
