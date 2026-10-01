"use client";

import { useRef, useState, type FormEvent } from "react";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  createKnowledgeText,
  updateKnowledge,
  uploadKnowledgeFile,
} from "@/lib/api/knowledge";
import { cn } from "@/lib/cn";
import { knowledgeErrorMessage } from "@/lib/knowledge-errors";
import type { KnowledgeDocument, KnowledgeSourceType } from "@/types/knowledge";

const MAX_TEXT_CHARS = 200_000;

type Mode = "text" | "file";

function sourceTypeOf(file: File): KnowledgeSourceType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".docx")) return "DOCX";
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) {
    return "TEXT";
  }
  return null;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function titleFromFilename(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

type DocumentFormProps = {
  open: boolean;
  /** When set, only the title and description are editable. */
  document?: KnowledgeDocument | null;
  maxFileBytes: number;
  onClose: () => void;
  onSaved: () => void;
};

/** Mount with a fresh `key` per open so state resets without effects. */
export function DocumentForm({
  open,
  document,
  maxFileBytes,
  onClose,
  onSaved,
}: DocumentFormProps) {
  const editing = Boolean(document);
  const fileInput = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("text");
  const [title, setTitle] = useState(document?.title ?? "");
  const [description, setDescription] = useState(document?.description ?? "");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function pickFile(next: File | null) {
    setContentError("");
    if (!next) {
      setFile(null);
      return;
    }
    if (!sourceTypeOf(next)) {
      setFile(null);
      setContentError("Only .pdf, .md, .txt and .docx files are supported.");
      return;
    }
    if (maxFileBytes > 0 && next.size > maxFileBytes) {
      setFile(null);
      setContentError(`That file is over the ${formatBytes(maxFileBytes)} limit.`);
      return;
    }
    setFile(next);
    if (!title.trim()) {
      setTitle(titleFromFilename(next.name));
      setTitleError("");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Give this document a title.");
      return;
    }
    setTitleError("");

    if (!editing) {
      if (mode === "text" && !content.trim()) {
        setContentError("Write or paste some text first.");
        return;
      }
      if (mode === "file" && !file) {
        setContentError("Choose a file to upload.");
        return;
      }
    }
    setContentError("");
    setSubmitError("");
    setSubmitting(true);

    try {
      if (document) {
        await updateKnowledge(document.id, {
          title: trimmedTitle,
          description: description.trim(),
        });
      } else if (mode === "file" && file) {
        await uploadKnowledgeFile({
          title: trimmedTitle,
          description: description.trim() || undefined,
          file,
          sourceType: sourceTypeOf(file) ?? "TEXT",
        });
      } else {
        await createKnowledgeText({
          title: trimmedTitle,
          description: description.trim() || undefined,
          content: content.trim(),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setSubmitError(
        knowledgeErrorMessage(
          err,
          editing ? "Couldn't save changes." : "Couldn't add the document.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Edit document" : "Add knowledge"}
      description={
        editing
          ? "Change how this document is labelled. The text itself stays as uploaded."
          : "FAQs, policies, house rules — anything the AI should be able to look up when guests ask."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-auto! min-w-24"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="w-auto! min-w-28"
            loading={submitting}
            type="submit"
            form="knowledge-form"
          >
            {editing ? "Save changes" : "Add document"}
          </Button>
        </div>
      }
    >
      <form
        id="knowledge-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {!editing ? (
          <div
            role="radiogroup"
            aria-label="How to add"
            className="inline-flex rounded-xl bg-surface-container-low p-1"
          >
            {(
              [
                { id: "text", label: "Write text", icon: "edit_note" },
                { id: "file", label: "Upload file", icon: "upload_file" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={mode === item.id}
                onClick={() => {
                  setMode(item.id);
                  setContentError("");
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  mode === item.id
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <Input
          label="Title"
          name="knowledge-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={titleError}
          maxLength={200}
          placeholder="e.g. Cancellation policy"
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="knowledge-description"
            className="text-sm font-medium text-on-surface"
          >
            Description <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <textarea
            id="knowledge-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={2}
            placeholder="A short note for your team about what this covers."
            className="w-full resize-y rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        {!editing && mode === "text" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="knowledge-content"
              className="text-sm font-medium text-on-surface"
            >
              Content
            </label>
            <textarea
              id="knowledge-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={MAX_TEXT_CHARS}
              rows={9}
              aria-invalid={contentError ? true : undefined}
              placeholder={
                "Write it the way you'd explain it to a guest.\n\nExample: Reservations can be cancelled free of charge up to 3 hours before. Later cancellations forfeit the deposit."
              }
              className={cn(
                "w-full resize-y rounded-xl border bg-surface px-3 py-2.5 text-sm leading-6 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
                contentError ? "border-error" : "border-outline-variant",
              )}
            />
          </div>
        ) : null}

        {!editing && mode === "file" ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-on-surface">File</span>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                pickFile(event.dataTransfer.files?.[0] ?? null);
              }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : contentError
                    ? "border-error/60"
                    : "border-outline-variant",
              )}
            >
              <Icon
                name={file ? "task" : "cloud_upload"}
                size={32}
                className="text-primary-dark"
              />
              {file ? (
                <p className="text-sm text-on-surface">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-on-surface-variant"> · {formatBytes(file.size)}</span>
                </p>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Drag a file here, or choose one
                </p>
              )}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary-dark underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {file ? "Choose a different file" : "Browse files"}
              </button>
              <p className="text-xs text-on-surface-variant">
                .pdf, .md, .txt or .docx
                {maxFileBytes > 0 ? ` · up to ${formatBytes(maxFileBytes)}` : ""}
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.md,.markdown,.txt,.docx"
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                  pickFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        ) : null}

        {contentError ? (
          <p role="alert" className="text-sm text-error">
            {contentError}
          </p>
        ) : null}
        {submitError ? (
          <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
            {submitError}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}
