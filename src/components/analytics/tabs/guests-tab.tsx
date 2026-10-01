"use client";

import { useMemo } from "react";
import { BarChart, BarList, Funnel, Ring } from "@/components/analytics/charts";
import {
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
  fmtPct,
  ratio,
  shortDay,
} from "@/lib/analytics-report";

export function GuestsTab({ range, previous, rangeSlug }: TabProps) {
  const customers = useReport("customers", range);
  const prevCustomers = useReport("customers", previous);
  const conversion = useReport("conversion", range);

  const days = useMemo(
    () =>
      fillDays(range, customers.data?.series, (date) => ({ date, value: 0 })),
    [range, customers.data],
  );

  const exportRows = useMemo(() => {
    const c = conversion.data?.summary;
    if (!c) return [];
    return [
      ["Date", "New guests"],
      ...days.map((d) => [d.date, d.value]),
      [],
      ["Funnel step", "Count"],
      ["Conversations", c.conversations],
      ["Led to a reservation", c.conversations_with_reservation],
      ["Reservations created", c.reservations_created],
      ["Completed", c.reservations_completed],
      ["Cancelled", c.reservations_cancelled],
    ];
  }, [conversion.data, days]);

  return (
    <div className="space-y-5">
      <ReportState
        resource={customers}
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
              icon="group"
              label="Total guests"
              value={fmtInt(s.total_customers)}
              hint="In your CRM"
              tone="secondary"
            />
            <StatCard
              icon="person_add"
              label="New guests"
              value={fmtInt(s.new_customers)}
              hint="First seen in this period"
              delta={
                prevCustomers.data
                  ? deltaPct(s.new_customers, prevCustomers.data.summary.new_customers)
                  : undefined
              }
              tone="success"
            />
            <StatCard
              icon="bolt"
              label="Active guests"
              value={fmtInt(s.active_customers)}
              hint={`${fmtPct(ratio(s.active_customers, s.total_customers))} of all guests`}
              tone="info"
            />
            <StatCard
              icon="event_available"
              label="Guests who booked"
              value={fmtInt(s.customers_with_reservations)}
              hint={`${fmtInt(s.customers_with_conversations)} chatted with you`}
            />
          </StatGrid>
        )}
      </ReportState>

      <Panel
        title="New guests"
        subtitle="Per day"
        action={<ExportButton filename={`diuk-guests-${rangeSlug}.csv`} rows={exportRows} />}
      >
        <ReportState resource={customers} skeleton={<Skeleton className="h-52" />}>
          {() => (
            <BarChart
              data={days.map((day) => ({
                label: shortDay(day.date),
                axis: shortDay(day.date),
                value: day.value,
              }))}
              tone="info"
            />
          )}
        </ReportState>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="From chat to table"
          subtitle="How conversations turn into visits"
        >
          <ReportState resource={conversion} skeleton={<Skeleton className="h-52" />}>
            {({ summary: c }) => (
              <div className="space-y-5">
                <Funnel
                  steps={[
                    { label: "Conversations", value: c.conversations },
                    {
                      label: "Led to a reservation",
                      value: c.conversations_with_reservation,
                    },
                    { label: "Reservations created", value: c.reservations_created },
                    { label: "Completed visits", value: c.reservations_completed },
                  ]}
                />
                <div className="grid grid-cols-3 gap-2 border-t border-outline-variant pt-4">
                  <Ring
                    size={80}
                    value={c.conversation_reservation_rate}
                    label="Chat → booking"
                    tone="primary"
                  />
                  <Ring
                    size={80}
                    value={c.completion_rate}
                    label="Completed"
                    tone="success"
                  />
                  <Ring
                    size={80}
                    value={c.cancellation_rate}
                    label="Cancelled"
                    tone="error"
                  />
                </div>
              </div>
            )}
          </ReportState>
        </Panel>

        <Panel
          title="Payment follow-through"
          subtitle="Reservations that needed payment"
        >
          <ReportState resource={conversion} skeleton={<Skeleton className="h-52" />}>
            {({ summary: c }) => (
              <div className="space-y-5">
                <BarList
                  items={[
                    {
                      label: "Required payment",
                      value: c.reservations_requiring_payment,
                      tone: "secondary",
                    },
                    { label: "Paid", value: c.reservations_paid, tone: "success" },
                    { label: "Not paid yet", value: c.reservations_unpaid, tone: "warning" },
                    {
                      label: "Cancelled after paying",
                      value: c.reservations_cancelled_after_payment,
                      tone: "error",
                    },
                    { label: "Refunded", value: c.reservations_refunded, tone: "info" },
                  ]}
                  empty="No reservations required payment in this period."
                />
                <div className="grid grid-cols-2 gap-2 border-t border-outline-variant pt-4">
                  <Ring
                    size={80}
                    value={c.payment_collection_rate}
                    label="Collected"
                    tone="success"
                  />
                  <Ring
                    size={80}
                    value={c.paid_reservation_confirmation_rate}
                    label="Paid & confirmed"
                    tone="primary"
                  />
                </div>
              </div>
            )}
          </ReportState>
        </Panel>
      </div>
    </div>
  );
}
