"use client";

import { useMemo } from "react";
import { BarChart, BarList, StackedBars } from "@/components/analytics/charts";
import {
  DataTable,
  ExportButton,
  Panel,
  ReportState,
  Skeleton,
  StatCard,
  StatGrid,
} from "@/components/analytics/primitives";
import type { TabProps } from "@/components/analytics/tab-props";
import { useReport } from "@/hooks/use-analytics-report";
import {
  WEEKDAYS,
  deltaPct,
  fillDays,
  fmtDecimal,
  fmtInt,
  fmtPct,
  hourLabel,
  ratio,
  shortDay,
} from "@/lib/analytics-report";

export function ReservationsTab({ range, previous, rangeSlug }: TabProps) {
  const reservations = useReport("reservations", range);
  const prev = useReport("reservations", previous);

  const days = useMemo(
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

  const exportRows = useMemo(() => {
    const s = reservations.data?.summary;
    if (!s) return [];
    return [
      ["Date", "Reservations", "Confirmed", "Completed", "Cancelled"],
      ...days.map((d) => [d.date, d.reservations, d.confirmed, d.completed, d.cancelled]),
      [],
      ["Table", "Area", "Reservations", "Completed", "Cancelled"],
      ...s.by_table.map((t) => [
        t.table_name,
        t.area_name,
        t.reservation_count,
        t.completed_count,
        t.cancelled_count,
      ]),
    ];
  }, [reservations.data, days]);

  return (
    <div className="space-y-5">
      <ReportState
        resource={reservations}
        skeleton={
          <StatGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </StatGrid>
        }
      >
        {({ summary: s }) => (
          <StatGrid>
            <StatCard
              icon="event"
              label="Reservations"
              value={fmtInt(s.total)}
              hint={`${fmtInt(s.pending)} pending · ${fmtInt(s.confirmed)} confirmed`}
              delta={prev.data ? deltaPct(s.total, prev.data.summary.total) : undefined}
              tone="secondary"
            />
            <StatCard
              icon="task_alt"
              label="Completion rate"
              value={fmtPct(s.completion_rate)}
              hint={`${fmtInt(s.completed)} completed`}
              tone="success"
            />
            <StatCard
              icon="event_busy"
              label="Cancellation rate"
              value={fmtPct(s.cancellation_rate)}
              hint={`${fmtInt(s.cancelled)} cancelled`}
              delta={
                prev.data
                  ? deltaPct(s.cancellation_rate, prev.data.summary.cancellation_rate)
                  : undefined
              }
              invertDelta
              tone="error"
            />
            <StatCard
              icon="groups"
              label="Avg. party size"
              value={fmtDecimal(s.average_party_size)}
              hint={`${fmtInt(s.total_party_size)} guests booked`}
              tone="info"
            />
          </StatGrid>
        )}
      </ReportState>

      <Panel
        title="Bookings over time"
        subtitle="Per day, by status"
        action={
          <ExportButton filename={`diuk-reservations-${rangeSlug}.csv`} rows={exportRows} />
        }
      >
        <ReportState resource={reservations} skeleton={<Skeleton className="h-52" />}>
          {() => (
            <StackedBars
              data={days.map((day) => ({
                label: shortDay(day.date),
                axis: shortDay(day.date),
                parts: [
                  day.completed,
                  day.confirmed,
                  Math.max(0, day.reservations - day.completed - day.confirmed - day.cancelled),
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

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="By day of week" subtitle="When guests book">
          <ReportState resource={reservations} skeleton={<Skeleton className="h-44" />}>
            {({ summary }) => {
              const rows = Array.from({ length: 7 }, (_, i) => {
                const hit = summary.by_weekday.find((d) => d.day_of_week === i);
                return { label: WEEKDAYS[i], value: hit?.reservation_count ?? 0 };
              });
              // Monday-first reads more naturally for a venue week.
              const ordered = [...rows.slice(1), rows[0]];
              return <BarChart data={ordered} tone="secondary" height={144} />;
            }}
          </ReportState>
        </Panel>

        <Panel title="By hour" subtitle="Busiest times of day">
          <ReportState resource={reservations} skeleton={<Skeleton className="h-44" />}>
            {({ summary }) => (
              <BarChart
                data={Array.from({ length: 24 }, (_, hour) => ({
                  label: hourLabel(hour),
                  axis: String(hour).padStart(2, "0"),
                  value: summary.by_hour.find((h) => h.hour === hour)?.reservation_count ?? 0,
                }))}
                tone="info"
                height={144}
              />
            )}
          </ReportState>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="By area" subtitle="Where guests sit">
          <ReportState resource={reservations} skeleton={<Skeleton className="h-44" />}>
            {({ summary }) => (
              <BarList
                showShare
                items={[...summary.by_area]
                  .sort((a, b) => b.reservation_count - a.reservation_count)
                  .map((area) => ({
                    label: area.area_name,
                    value: area.reservation_count,
                    hint: `${fmtInt(area.completed_count)} completed · ${fmtInt(area.cancelled_count)} cancelled`,
                  }))}
              />
            )}
          </ReportState>
        </Panel>

        <Panel title="Top tables" subtitle="Most booked tables in this period">
          <ReportState resource={reservations} skeleton={<Skeleton className="h-44" />}>
            {({ summary }) => (
              <DataTable
                rows={[...summary.by_table]
                  .sort((a, b) => b.reservation_count - a.reservation_count)
                  .slice(0, 10)}
                rowKey={(row) => row.table_id}
                columns={[
                  { header: "Table", cell: (row) => row.table_name },
                  { header: "Area", cell: (row) => row.area_name },
                  {
                    header: "Bookings",
                    align: "right",
                    cell: (row) => fmtInt(row.reservation_count),
                  },
                  {
                    header: "Completed",
                    align: "right",
                    cell: (row) => fmtInt(row.completed_count),
                  },
                  {
                    header: "Cancelled",
                    align: "right",
                    cell: (row) =>
                      `${fmtInt(row.cancelled_count)} (${fmtPct(ratio(row.cancelled_count, row.reservation_count))})`,
                  },
                ]}
                empty="No table assignments in this period."
              />
            )}
          </ReportState>
        </Panel>
      </div>
    </div>
  );
}