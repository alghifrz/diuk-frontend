"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { KnowledgeSummary } from "@/types/ai";

type KnowledgeSummaryProps = {
  summary: KnowledgeSummary;
  loading: boolean;
  error: string;
  onRetry: () => void;
};

export function KnowledgeSummaryCard({
  summary,
  loading,
  error,
  onRetry,
}: KnowledgeSummaryProps) {
  if (loading) {
    return (
      <div
        className="h-20 animate-pulse rounded-2xl bg-surface-container-low"
        aria-label="Loading knowledge summary"
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface p-4">
        <p className="text-sm text-error">{error}</p>
        <Button variant="ghost" className="mt-2 w-auto" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
          <Icon name="menu_book" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-on-surface">
              Extra documents
            </h3>
            <Link
              href="/knowledge"
              className="text-xs font-medium text-primary-dark underline-offset-2 hover:underline"
            >
              Manage
            </Link>
          </div>
          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
            Optional FAQ or policy files the AI can search. Menu and hours still
            come from their own pages.
          </p>
          {summary.total === 0 ? (
            <p className="mt-2 text-sm text-on-surface-variant">
              No documents uploaded yet.
            </p>
          ) : (
            <p className="mt-2 text-sm text-on-surface">
              <span className="font-semibold tabular-nums">{summary.ready}</span>{" "}
              ready
              {summary.processing + summary.pending > 0
                ? ` · ${summary.processing + summary.pending} processing`
                : ""}
              {summary.failed > 0 ? ` · ${summary.failed} failed` : ""}
              {" · "}
              {summary.total} total
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
