"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type {
  KnowledgeDocument,
  KnowledgeDocumentStatus,
} from "@/types/knowledge";

const STATUS: Record<
  KnowledgeDocumentStatus,
  { label: string; className: string; spinning?: boolean }
> = {
  READY: { label: "Ready", className: "bg-success/15 text-success" },
  PENDING: { label: "Queued", className: "bg-info/15 text-info", spinning: true },
  PROCESSING: {
    label: "Reading…",
    className: "bg-info/15 text-info",
    spinning: true,
  },
  FAILED: { label: "Failed", className: "bg-error/10 text-error" },
  ARCHIVED: {
    label: "Archived",
    className: "bg-surface-container-low text-on-surface-variant",
  },
};

const SOURCE_ICON: Record<string, string> = {
  PDF: "picture_as_pdf",
  DOCX: "description",
  TEXT: "article",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusChip({ status }: { status: KnowledgeDocumentStatus }) {
  const meta = STATUS[status] ?? STATUS.ARCHIVED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        meta.className,
      )}
    >
      {meta.spinning ? (
        <Icon name="progress_activity" size={12} className="animate-spin" />
      ) : null}
      {meta.label}
    </span>
  );
}

function IconAction({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40",
        danger
          ? "hover:bg-error/10 hover:text-error"
          : "hover:bg-surface-container-low hover:text-on-surface",
      )}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

export function DocumentList({
  documents,
  busyId,
  onEdit,
  onReprocess,
  onDelete,
}: {
  documents: KnowledgeDocument[];
  /** Document with an action in flight. */
  busyId: string | null;
  onEdit: (doc: KnowledgeDocument) => void;
  onReprocess: (doc: KnowledgeDocument) => void;
  onDelete: (doc: KnowledgeDocument) => void;
}) {
  return (
    <ul className="divide-y divide-outline-variant/70">
      {documents.map((doc) => {
        const working =
          doc.status === "PENDING" || doc.status === "PROCESSING";
        return (
          <li key={doc.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
              <Icon name={SOURCE_ICON[doc.source_type] ?? "article"} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="min-w-0 truncate text-sm font-semibold text-on-surface">
                  {doc.title}
                </h3>
                <StatusChip status={doc.status} />
              </div>
              {doc.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                  {doc.description}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-on-surface-variant">
                {doc.source_type === "TEXT" ? "Text" : doc.source_type}
                {" · "}Updated {formatDate(doc.updated_at)}
                {doc.version > 1 ? ` · v${doc.version}` : ""}
              </p>
              {doc.status === "FAILED" ? (
                <p className="mt-1.5 text-xs text-error">
                  {doc.processing_error || "Something went wrong while reading this document."}{" "}
                  Try reprocessing it.
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center">
              <IconAction
                icon="edit"
                label="Edit title and description"
                onClick={() => onEdit(doc)}
                disabled={busyId === doc.id}
              />
              <IconAction
                icon="refresh"
                label="Reprocess"
                onClick={() => onReprocess(doc)}
                disabled={busyId === doc.id || working}
              />
              <IconAction
                icon="delete"
                label="Delete"
                danger
                onClick={() => onDelete(doc)}
                disabled={busyId === doc.id}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
