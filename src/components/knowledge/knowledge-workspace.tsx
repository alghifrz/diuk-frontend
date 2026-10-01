"use client";

import { useMemo, useState } from "react";
import { StatCard, StatGrid } from "@/components/analytics/primitives";
import { Dialog } from "@/components/reservations/dialog";
import { DocumentForm } from "@/components/knowledge/document-form";
import { DocumentList } from "@/components/knowledge/document-list";
import { TestPanel } from "@/components/knowledge/test-panel";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { isDocumentBusy, useKnowledgeDocuments, useKnowledgeStatus } from "@/hooks/use-knowledge";
import { deleteKnowledge, reprocessKnowledge } from "@/lib/api/knowledge";
import { knowledgeErrorMessage } from "@/lib/knowledge-errors";
import type { KnowledgeDocument } from "@/types/knowledge";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export function KnowledgeWorkspace() {
  const docs = useKnowledgeDocuments();
  const status = useKnowledgeStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<KnowledgeDocument | null>(null);
  const [deleting, setDeleting] = useState<KnowledgeDocument | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const items = useMemo(() => docs.data ?? [], [docs.data]);
  const enabled = status.data?.enabled ?? true;

  const counts = useMemo(() => {
    let ready = 0;
    let working = 0;
    let failed = 0;
    for (const doc of items) {
      if (doc.status === "READY") ready += 1;
      else if (isDocumentBusy(doc)) working += 1;
      else if (doc.status === "FAILED") failed += 1;
    }
    return { total: items.length, ready, working, failed };
  }, [items]);

  function openCreate() {
    setEditing(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  function openEdit(doc: KnowledgeDocument) {
    setEditing(doc);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  async function handleReprocess(doc: KnowledgeDocument) {
    setBusyId(doc.id);
    setActionError("");
    try {
      await reprocessKnowledge(doc.id);
      await docs.refetch();
    } catch (err) {
      setActionError(knowledgeErrorMessage(err, "Couldn't reprocess that document."));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setBusyId(target.id);
    setActionError("");
    try {
      await deleteKnowledge(target.id);
      docs.mutate((prev) => (prev ?? []).filter((doc) => doc.id !== target.id));
      setDeleting(null);
    } catch (err) {
      setDeleting(null);
      setActionError(knowledgeErrorMessage(err, "Couldn't delete that document."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
          Give the AI answers it can&apos;t get from your menu or opening hours —
          policies, FAQs, house rules. It looks them up by meaning, so guests
          don&apos;t have to use the exact words.
        </p>
        <Button className="w-auto!" onClick={openCreate}>
          <Icon name="add" size={18} />
          Add knowledge
        </Button>
      </div>

      {!enabled ? (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-on-surface">
          <Icon name="warning" size={20} className="mt-0.5 shrink-0 text-warning" />
          <p>
            Knowledge search isn&apos;t switched on for this server yet, so new
            documents can&apos;t be read and the AI can&apos;t use them. Ask your
            administrator to enable it.
          </p>
        </div>
      ) : null}

      {actionError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="rounded-lg px-3 py-1.5 font-medium underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <StatGrid>
        <StatCard icon="menu_book" label="Documents" value={String(counts.total)} tone="secondary" />
        <StatCard icon="task_alt" label="Ready for AI" value={String(counts.ready)} tone="success" />
        <StatCard
          icon="hourglass_top"
          label="Being read"
          value={String(counts.working)}
          hint={counts.working > 0 ? "Updates automatically" : undefined}
          tone="info"
        />
        <StatCard icon="error" label="Failed" value={String(counts.failed)} tone="error" />
      </StatGrid>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] sm:p-6">
          <h2 className="mb-4 text-base font-semibold tracking-tight text-on-surface">
            Your documents
          </h2>

          {docs.data === undefined && docs.error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
              <span>{docs.error}</span>
              <button
                type="button"
                onClick={() => void docs.refetch()}
                className="rounded-lg px-3 py-1.5 font-medium underline-offset-2 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : docs.data === undefined ? (
            <div className="space-y-3" aria-label="Loading documents">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-container-low" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant px-4 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                <Icon name="menu_book" size={26} />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">Nothing here yet</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-on-surface-variant">
                  Start with the questions guests ask most — cancellations, pets,
                  parking, dress code — then try them on the right.
                </p>
              </div>
              <Button className="w-auto!" onClick={openCreate}>
                <Icon name="add" size={18} />
                Add your first document
              </Button>
            </div>
          ) : (
            <DocumentList
              documents={items}
              busyId={busyId}
              onEdit={openEdit}
              onReprocess={(doc) => void handleReprocess(doc)}
              onDelete={setDeleting}
            />
          )}
        </section>

        <TestPanel
          enabled={enabled}
          hasReadyDocuments={counts.ready > 0}
        />
      </div>

      <DocumentForm
        key={formKey}
        open={formOpen}
        document={editing}
        maxFileBytes={status.data?.max_file_bytes ?? DEFAULT_MAX_BYTES}
        onClose={() => setFormOpen(false)}
        onSaved={() => void docs.refetch()}
      />

      <Dialog
        open={Boolean(deleting)}
        onClose={() => (busyId ? undefined : setDeleting(null))}
        title="Delete this document?"
        description="The AI will stop using it right away. This can't be undone."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto! min-w-24"
              onClick={() => setDeleting(null)}
              disabled={Boolean(busyId)}
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              className="w-auto! min-w-28"
              loading={Boolean(busyId)}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-on-surface">
          <span className="font-semibold">{deleting?.title}</span>
        </p>
      </Dialog>
    </div>
  );
}
