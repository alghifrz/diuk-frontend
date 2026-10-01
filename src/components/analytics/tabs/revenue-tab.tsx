"use client";

import { useMemo } from "react";
import { BarChart, Ring } from "@/components/analytics/charts";
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
  deltaPct,
  fillDays,
  fmtInt,
  shortDay,
  toNum,
} from "@/lib/analytics-report";
import { formatMenuPrice } from "@/lib/format-price";

export function RevenueTab({ range, previous, currency, rangeSlug }: TabProps) {
  const revenue = useReport("revenue", range);
  const prevRevenue = useReport("revenue", previous);

  const money = (value: number) => formatMenuPrice(Math.round(value), currency);

  const days = useMemo(
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

  const exportRows = useMemo(
    () => [
      ["Date", "Payments", "Paid orders", "Billed", "Collected"],
      ...days.map((day) => [
        day.date,
        day.payment_records,
        day.paid_count,
        toNum(day.total_amount),
        toNum(day.paid_amount),
      ]),
    ],
    [days],
  );

  return (
    <div className="space-y-5">
      <ReportState
        resource={revenue}
        skeleton={
          <StatGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </StatGrid>
        }
      >
        {({ summary }) => {
          const paid = toNum(summary.paid_amount);
          const prev = prevRevenue.data?.summary;
          return (
            <StatGrid>
              <StatCard
                icon="payments"
                label="Collected"
                value={money(paid)}
                hint={`${fmtInt(summary.paid_count)} paid orders`}
                delta={prev ? deltaPct(paid, toNum(prev.paid_amount)) : undefined}
                tone="success"
              />
              <StatCard
                icon="hourglass_top"
                label="Awaiting payment"
                value={money(toNum(summary.unpaid_amount))}
                hint={`${fmtInt(summary.unpaid_count)} unpaid`}
                tone="warning"
              />
              <StatCard
                icon="undo"
                label="Refunded"
                value={money(toNum(summary.refunded_amount))}
                hint={`${fmtInt(summary.refunded_count)} refunds`}
                tone="error"
              />
              <StatCard
                icon="receipt_long"
                label="Avg. payment"
                value={money(summary.paid_count > 0 ? paid / summary.paid_count : 0)}
                hint="Per paid order"
              />
            </StatGrid>
          );
        }}
      </ReportState>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="Daily revenue"
          subtitle="Money collected from fully paid orders"
          action={<ExportButton filename={`diuk-revenue-${rangeSlug}.csv`} rows={exportRows} />}
        >
          <ReportState resource={revenue} skeleton={<Skeleton className="h-52" />}>
            {() => (
              <BarChart
                data={days.map((day) => ({
                  label: shortDay(day.date),
                  axis: shortDay(day.date),
                  value: toNum(day.paid_amount),
                }))}
                format={money}
              />
            )}
          </ReportState>
        </Panel>

        <Panel title="Collection rate" subtitle="Paid reservations that needed payment">
          <ReportState resource={revenue} skeleton={<Skeleton className="h-40" />}>
            {({ summary }) => (
              <div className="flex flex-col items-center gap-3">
                <Ring
                  value={summary.payment_collection_rate}
                  label="Collected"
                  tone="success"
                  size={120}
                />
                <p className="text-center text-xs text-on-surface-variant">
                  {fmtInt(summary.reservations_requiring_payment)} reservations required
                  payment in this period.
                </p>
              </div>
            )}
          </ReportState>
        </Panel>
      </div>

      <Panel title="Daily breakdown" subtitle="Only days with payment activity">
        <ReportState resource={revenue} skeleton={<Skeleton className="h-40" />}>
          {() => {
            const active = days.filter((day) => day.payment_records > 0);
            const totals = active.reduce(
              (acc, day) => ({
                records: acc.records + day.payment_records,
                paid: acc.paid + day.paid_count,
                billed: acc.billed + toNum(day.total_amount),
                collected: acc.collected + toNum(day.paid_amount),
              }),
              { records: 0, paid: 0, billed: 0, collected: 0 },
            );
            return (
              <DataTable
                rows={[...active].reverse()}
                rowKey={(row) => row.date}
                columns={[
                  { header: "Date", cell: (row) => shortDay(row.date), footer: "Total" },
                  {
                    header: "Payments",
                    align: "right",
                    cell: (row) => fmtInt(row.payment_records),
                    footer: fmtInt(totals.records),
                  },
                  {
                    header: "Paid orders",
                    align: "right",
                    cell: (row) => fmtInt(row.paid_count),
                    footer: fmtInt(totals.paid),
                  },
                  {
                    header: "Billed",
                    align: "right",
                    cell: (row) => money(toNum(row.total_amount)),
                    footer: money(totals.billed),
                  },
                  {
                    header: "Collected",
                    align: "right",
                    cell: (row) => money(toNum(row.paid_amount)),
                    footer: money(totals.collected),
                  },
                ]}
                empty="No payments were recorded in this period."
              />
            );
          }}
        </ReportState>
      </Panel>
    </div>
  );
}
