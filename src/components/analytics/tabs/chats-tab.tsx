"use client";

import { useMemo } from "react";
import { BarChart, BarList, Ring } from "@/components/analytics/charts";
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
  fmtDuration,
  fmtInt,
  fmtLatency,
  fmtPct,
  humanize,
  ratio,
  shortDay,
} from "@/lib/analytics-report";

export function ChatsTab({ range, previous, rangeSlug }: TabProps) {
  const conversations = useReport("conversations", range);
  const prevConversations = useReport("conversations", previous);
  const ai = useReport("ai", range);
  const handover = useReport("handover", range);

  const days = useMemo(
    () =>
      fillDays(range, conversations.data?.series, (date) => ({ date, value: 0 })),
    [range, conversations.data],
  );

  const exportRows = useMemo(() => {
    const c = conversations.data?.summary;
    if (!c) return [];
    return [
      ["Date", "New conversations"],
      ...days.map((d) => [d.date, d.value]),
      [],
      ["Channel", "Conversations"],
      ...c.by_channel.map((x) => [humanize(x.key), x.count]),
      [],
      ["Handling state", "Conversations"],
      ...c.by_handling_state.map((x) => [humanize(x.key), x.count]),
    ];
  }, [conversations.data, days]);

  return (
    <div className="space-y-5">
      <ReportState
        resource={conversations}
        skeleton={
          <StatGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </StatGrid>
        }
      >
        {({ summary: c }) => (
          <StatGrid>
            <StatCard
              icon="chat"
              label="Conversations"
              value={fmtInt(c.total)}
              hint={`${fmtInt(c.open)} open · ${fmtInt(c.closed)} closed`}
              delta={
                prevConversations.data
                  ? deltaPct(c.total, prevConversations.data.summary.total)
                  : undefined
              }
              tone="info"
            />
            <StatCard
              icon="psychology"
              label="Handled by AI"
              value={fmtPct(ratio(c.ai_handled, c.ai_handled + c.human_handled))}
              hint={`${fmtInt(c.ai_handled)} AI · ${fmtInt(c.human_handled)} human`}
              tone="secondary"
            />
            <StatCard
              icon="support_agent"
              label="Asked for a human"
              value={fmtInt(c.human_requested)}
              hint={`${fmtPct(ratio(c.human_requested, c.total))} of conversations`}
              tone="warning"
            />
            <StatCard
              icon="timer"
              label="Avg. conversation"
              value={fmtDuration(c.average_conversation_duration)}
              hint="From first to last message"
            />
          </StatGrid>
        )}
      </ReportState>

      <Panel
        title="New conversations"
        subtitle="Per day"
        action={<ExportButton filename={`diuk-chats-${rangeSlug}.csv`} rows={exportRows} />}
      >
        <ReportState resource={conversations} skeleton={<Skeleton className="h-52" />}>
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
        <Panel title="By channel" subtitle="Where guests reach you">
          <ReportState resource={conversations} skeleton={<Skeleton className="h-36" />}>
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
        <Panel title="Who is handling" subtitle="Current handling state">
          <ReportState resource={conversations} skeleton={<Skeleton className="h-36" />}>
            {({ summary }) => (
              <BarList
                showShare
                tone="secondary"
                items={summary.by_handling_state.map((x) => ({
                  label: humanize(x.key),
                  value: x.count,
                }))}
              />
            )}
          </ReportState>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel title="AI assistant" subtitle="Reply generation health">
          <ReportState resource={ai} skeleton={<Skeleton className="h-52" />}>
            {({ summary: a }) => (
              <div className="space-y-5">
                <div className="flex items-center gap-6">
                  <Ring
                    size={96}
                    value={ratio(a.successful_generations, a.total_ai_generations)}
                    label="Success rate"
                    tone="success"
                  />
                  <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <Fact label="Generations" value={fmtInt(a.total_ai_generations)} />
                    <Fact label="Messages sent" value={fmtInt(a.ai_messages_generated)} />
                    <Fact label="Failed" value={fmtInt(a.failed_generations)} />
                    <Fact label="Skipped" value={fmtInt(a.skipped_generations)} />
                    <Fact
                      label="Avg. latency"
                      value={fmtLatency(a.average_ai_generation_latency)}
                    />
                  </dl>
                </div>
                <DataTable
                  rows={a.by_provider}
                  rowKey={(row) => `${row.provider}:${row.model}`}
                  columns={[
                    { header: "Model", cell: (row) => `${row.provider} · ${row.model}` },
                    {
                      header: "Runs",
                      align: "right",
                      cell: (row) => fmtInt(row.generation_count),
                    },
                    {
                      header: "Failed",
                      align: "right",
                      cell: (row) => fmtInt(row.failure_count),
                    },
                    {
                      header: "Latency",
                      align: "right",
                      cell: (row) => fmtLatency(row.average_latency_ms),
                    },
                  ]}
                  empty="No AI generations in this period."
                />
              </div>
            )}
          </ReportState>
        </Panel>

        <Panel title="Handover to staff" subtitle="When the AI passes a chat to a person">
          <ReportState resource={handover} skeleton={<Skeleton className="h-52" />}>
            {({ summary: h }) => (
              <div className="space-y-5">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  <Fact label="Handovers" value={fmtInt(h.handover_count)} />
                  <Fact label="Picked up" value={fmtInt(h.human_started_count)} />
                  <Fact label="Resolved" value={fmtInt(h.human_resolved_count)} />
                  <Fact
                    label="Time to reply"
                    value={fmtDuration(h.average_time_to_human)}
                  />
                </dl>
                <p className="text-xs text-on-surface-variant">
                  Average time a person spends on a handed-over chat:{" "}
                  <span className="font-semibold text-on-surface">
                    {fmtDuration(h.average_human_handling_duration)}
                  </span>
                </p>
                <BarList
                  tone="warning"
                  showShare
                  items={h.by_reason.map((x) => ({
                    label: humanize(x.key),
                    value: x.count,
                  }))}
                  empty="No handovers in this period."
                />
              </div>
            )}
          </ReportState>
        </Panel>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
        {label}
      </dt>
      <dd className="truncate text-lg font-semibold text-on-surface tabular-nums">
        {value}
      </dd>
    </div>
  );
}
