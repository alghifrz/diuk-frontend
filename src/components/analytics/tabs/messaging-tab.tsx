"use client";

import { useMemo } from "react";
import { BarChart, BarList, Funnel, Ring } from "@/components/analytics/charts";
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
  fmtPct,
  humanize,
  ratio,
  shortDay,
} from "@/lib/analytics-report";

export function MessagingTab({ range, previous, rangeSlug }: TabProps) {
  const messaging = useReport("messaging", range);
  const prevMessaging = useReport("messaging", previous);
  const automation = useReport("automation", range);
  const campaigns = useReport("campaigns", range);

  const days = useMemo(
    () => fillDays(range, messaging.data?.series, (date) => ({ date, value: 0 })),
    [range, messaging.data],
  );

  const exportRows = useMemo(() => {
    const m = messaging.data?.summary;
    if (!m) return [];
    return [
      ["Date", "Messages"],
      ...days.map((d) => [d.date, d.value]),
      [],
      ["Delivery status", "Messages"],
      ...m.by_status.map((x) => [humanize(x.key), x.count]),
      [],
      ["Automation", "Action", "Runs", "Successful", "Failed", "Skipped"],
      ...(automation.data?.summary.by_automation ?? []).map((a) => [
        a.automation_name,
        humanize(a.action_type),
        a.total_runs,
        a.successful_runs,
        a.failed_runs,
        a.skipped_runs,
      ]),
    ];
  }, [messaging.data, automation.data, days]);

  return (
    <div className="space-y-5">
      <ReportState
        resource={messaging}
        skeleton={
          <StatGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </StatGrid>
        }
      >
        {({ summary: m }) => {
          const total = m.inbound_messages + m.outbound_messages;
          const prev = prevMessaging.data?.summary;
          return (
            <StatGrid>
              <StatCard
                icon="forum"
                label="Messages"
                value={fmtInt(total)}
                hint={`${fmtInt(m.inbound_messages)} in · ${fmtInt(m.outbound_messages)} out`}
                delta={
                  prev
                    ? deltaPct(total, prev.inbound_messages + prev.outbound_messages)
                    : undefined
                }
                tone="info"
              />
              <StatCard
                icon="mark_chat_read"
                label="Read rate"
                value={fmtPct(ratio(m.read, m.outbound_messages))}
                hint={`${fmtInt(m.read)} of ${fmtInt(m.outbound_messages)} sent`}
                tone="success"
              />
              <StatCard
                icon="done_all"
                label="Delivered"
                value={fmtPct(ratio(m.delivered + m.read, m.outbound_messages))}
                hint="Delivered or read"
              />
              <StatCard
                icon="error"
                label="Failed"
                value={fmtInt(m.failed)}
                hint={`${fmtPct(ratio(m.failed, m.outbound_messages))} of outbound`}
                tone="error"
              />
            </StatGrid>
          );
        }}
      </ReportState>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title="Message volume"
          subtitle="Per day, inbound and outbound"
          action={
            <ExportButton filename={`diuk-messaging-${rangeSlug}.csv`} rows={exportRows} />
          }
        >
          <ReportState resource={messaging} skeleton={<Skeleton className="h-52" />}>
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

        <Panel title="Outbound delivery" subtitle="Where sent messages ended up">
          <ReportState resource={messaging} skeleton={<Skeleton className="h-52" />}>
            {({ summary: m }) => (
              <Funnel
                tone="success"
                steps={[
                  { label: "Sent", value: m.sent + m.delivered + m.read },
                  { label: "Delivered", value: m.delivered + m.read },
                  { label: "Read", value: m.read },
                ]}
              />
            )}
          </ReportState>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Messages by channel">
          <ReportState resource={messaging} skeleton={<Skeleton className="h-36" />}>
            {({ summary }) => (
              <BarList
                showShare
                items={summary.by_channel.map((x) => ({
                  label: humanize(x.key),
                  value: x.count,
                }))}
              />
            )}
          </ReportState>
        </Panel>
        <Panel title="Messages by status">
          <ReportState resource={messaging} skeleton={<Skeleton className="h-36" />}>
            {({ summary }) => (
              <BarList
                showShare
                tone="secondary"
                items={summary.by_status.map((x) => ({
                  label: humanize(x.key),
                  value: x.count,
                  tone: /fail/i.test(x.key) ? "error" : undefined,
                }))}
              />
            )}
          </ReportState>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Automations" subtitle="Reminders and follow-ups that ran automatically">
          <ReportState resource={automation} skeleton={<Skeleton className="h-44" />}>
            {({ summary: a }) => (
              <div className="space-y-5">
                <div className="flex items-center gap-6">
                  <Ring
                    size={88}
                    value={a.success_rate}
                    label="Success rate"
                    tone="success"
                  />
                  <p className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">
                      {fmtInt(a.total_runs)}
                    </span>{" "}
                    runs · {fmtInt(a.failed_runs)} failed · {fmtInt(a.skipped_runs)} skipped
                  </p>
                </div>
                <DataTable
                  rows={a.by_automation}
                  rowKey={(row) => row.automation_id}
                  columns={[
                    { header: "Automation", cell: (row) => row.automation_name },
                    { header: "Action", cell: (row) => humanize(row.action_type) },
                    {
                      header: "Runs",
                      align: "right",
                      cell: (row) => fmtInt(row.total_runs),
                    },
                    {
                      header: "Failed",
                      align: "right",
                      cell: (row) => fmtInt(row.failed_runs),
                    },
                  ]}
                  empty="No automations ran in this period."
                />
              </div>
            )}
          </ReportState>
        </Panel>

        <Panel title="Campaigns" subtitle="Broadcasts to guests">
          <ReportState resource={campaigns} skeleton={<Skeleton className="h-44" />}>
            {({ summary: c }) => (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                      Campaign runs
                    </dt>
                    <dd className="text-lg font-semibold text-on-surface tabular-nums">
                      {fmtInt(c.total_runs)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
                      Recipients
                    </dt>
                    <dd className="text-lg font-semibold text-on-surface tabular-nums">
                      {fmtInt(c.total_recipients)}
                    </dd>
                  </div>
                </dl>
                <BarList
                  items={[
                    { label: "Sent", value: c.sent + c.delivered + c.read, tone: "primary" },
                    { label: "Delivered", value: c.delivered + c.read, tone: "info" },
                    { label: "Read", value: c.read, tone: "success" },
                    { label: "Failed", value: c.failed, tone: "error" },
                    { label: "Skipped", value: c.skipped, tone: "warning" },
                  ]}
                  empty="No campaigns were sent in this period."
                />
              </div>
            )}
          </ReportState>
        </Panel>
      </div>
    </div>
  );
}
