"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/area/confirm-dialog";
import { AICapabilities } from "@/components/prompt/ai-capabilities";
import {
  AIPromptEditor,
  EmptyPromptState,
  PromptStatusBadge,
  WritingTips,
} from "@/components/prompt/ai-prompt-editor";
import { AIPreview } from "@/components/prompt/ai-preview";
import { KnowledgeSummaryCard } from "@/components/prompt/knowledge-summary";
import { PromptHistory } from "@/components/prompt/prompt-history";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAISettings } from "@/hooks/use-ai-settings";
import { useKnowledgeSummary } from "@/hooks/use-knowledge-summary";
import { usePrompts } from "@/hooks/use-prompts";
import { aiErrorMessage } from "@/lib/ai-errors";
import { cn } from "@/lib/cn";
import {
  DEFAULT_PROMPT_NAME,
  STARTER_SYSTEM_PROMPT,
  type AIPrompt,
} from "@/types/ai";

type SaveState = "idle" | "saving" | "saved" | "failed";
type MainTab = "instructions" | "try" | "more";

export function PromptWorkspace() {
  const settings = useAISettings();
  const prompts = usePrompts(DEFAULT_PROMPT_NAME);
  const knowledge = useKnowledgeSummary();

  const [tab, setTab] = useState<MainTab>("instructions");
  const [editorText, setEditorText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AIPrompt | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [actionError, setActionError] = useState("");
  const [activateOpen, setActivateOpen] = useState(false);
  const [activateBusy, setActivateBusy] = useState(false);
  const [activateError, setActivateError] = useState("");
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [seedKey, setSeedKey] = useState<string | null>(null);

  const nextSeedKey = prompts.loading
    ? null
    : prompts.draft?.id ?? prompts.active?.id ?? "empty";

  if (nextSeedKey !== null && seedKey === null && !viewing) {
    setSeedKey(nextSeedKey);
    if (prompts.draft) {
      setEditingId(prompts.draft.id);
      setEditorText(prompts.draft.system_prompt);
    } else if (prompts.active) {
      setEditingId(null);
      setEditorText(prompts.active.system_prompt);
    } else {
      setEditingId(null);
      setEditorText("");
    }
  }

  const editable = useMemo(() => {
    if (viewing && viewing.status !== "DRAFT") {
      return null;
    }
    if (editingId) {
      return prompts.items.find((item) => item.id === editingId) ?? null;
    }
    return prompts.draft;
  }, [editingId, prompts.draft, prompts.items, viewing]);

  const dirty = Boolean(editable && editorText !== editable.system_prompt);
  const viewingHistory = Boolean(viewing && viewing.status !== "DRAFT");
  const readOnlyActive =
    !editable && Boolean(prompts.active) && !prompts.draft;
  const hasDraft = Boolean(editable?.status === "DRAFT");

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const syncEditorToPrompt = useCallback((prompt: AIPrompt) => {
    setEditingId(prompt.status === "DRAFT" ? prompt.id : null);
    setEditorText(prompt.system_prompt);
    setViewing(prompt.status === "DRAFT" ? null : prompt);
    setSaveState("idle");
    setActionError("");
  }, []);

  async function createDraft(systemPrompt: string) {
    setActionError("");
    setSaveState("saving");
    try {
      const created = await prompts.create({
        name: DEFAULT_PROMPT_NAME,
        system_prompt: systemPrompt.trim() || STARTER_SYSTEM_PROMPT,
      });
      setEditingId(created.id);
      setEditorText(created.system_prompt);
      setViewing(null);
      setSaveState("saved");
      setSeedKey(created.id);
      setTab("instructions");
      return created;
    } catch (err) {
      setSaveState("failed");
      setActionError(aiErrorMessage(err, "Couldn't create draft."));
      return null;
    }
  }

  async function handleSave() {
    const trimmed = editorText.trim();
    if (!trimmed) {
      setActionError("Instructions cannot be empty.");
      setSaveState("failed");
      return;
    }
    if ([...trimmed].length > 20000) {
      setActionError("Instructions are too long (max 20,000 characters).");
      setSaveState("failed");
      return;
    }

    setActionError("");
    setSaveState("saving");
    try {
      if (editable && editable.status === "DRAFT") {
        const updated = await prompts.update(editable.id, {
          system_prompt: trimmed,
        });
        setEditingId(updated.id);
        setEditorText(updated.system_prompt);
      } else {
        const created = await prompts.create({
          name: DEFAULT_PROMPT_NAME,
          system_prompt: trimmed,
        });
        setEditingId(created.id);
        setEditorText(created.system_prompt);
        setViewing(null);
        setSeedKey(created.id);
      }
      setSaveState("saved");
    } catch (err) {
      setSaveState("failed");
      setActionError(aiErrorMessage(err, "Couldn't save draft."));
    }
  }

  async function handleActivate() {
    if (!editable || editable.status !== "DRAFT") return;
    if (dirty) {
      setActivateError("Save your draft first, then make it live.");
      return;
    }
    setActivateBusy(true);
    setActivateError("");
    try {
      const activated = await prompts.activate(editable.id);
      setEditingId(null);
      setEditorText(activated.system_prompt);
      setViewing(null);
      setActivateOpen(false);
      setSaveState("idle");
      await prompts.refetch();
    } catch (err) {
      setActivateError(aiErrorMessage(err, "Couldn't make this version live."));
    } finally {
      setActivateBusy(false);
    }
  }

  async function handleRestoreAsDraft(prompt: AIPrompt) {
    setRestoreBusy(true);
    setActionError("");
    try {
      if (prompts.draft && dirty) {
        setActionError("Save or finish your current draft first.");
        return;
      }
      if (prompts.draft) {
        setActionError(
          "You already have a draft. Save or make it live before restoring an older version.",
        );
        return;
      }
      const created = await prompts.create({
        name: DEFAULT_PROMPT_NAME,
        system_prompt: prompt.system_prompt,
        description: `Restored from v${prompt.version}`,
      });
      syncEditorToPrompt(created);
      setHistoryOpen(false);
      setTab("instructions");
    } catch (err) {
      setActionError(aiErrorMessage(err, "Couldn't restore as draft."));
    } finally {
      setRestoreBusy(false);
    }
  }

  const showEmpty =
    !prompts.loading &&
    !prompts.error &&
    prompts.items.length === 0 &&
    !editorText;

  const liveVersion = prompts.active?.version ?? null;
  const editingVersion =
    viewingHistory && viewing
      ? viewing.version
      : editable?.version ?? prompts.active?.version ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-on-surface lg:text-lg">
              AI Assistant
            </h2>
            <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
              Teach your AI how to talk to customers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="w-auto min-w-0 px-3"
              onClick={() => setHistoryOpen(true)}
            >
              <Icon name="history" size={18} />
              Versions
            </Button>
          </div>
        </div>

        {!prompts.loading && !showEmpty ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <StatusChip
              label="AI status"
              value={
                settings.settings?.enabled === false
                  ? "Off"
                  : "On for customers"
              }
              tone={
                settings.settings?.enabled === false ? "warning" : "success"
              }
            />
            <StatusChip
              label="Live with customers"
              value={liveVersion != null ? `Version ${liveVersion}` : "None yet"}
              tone={liveVersion != null ? "success" : "muted"}
            />
            <StatusChip
              label="You are editing"
              value={
                viewingHistory
                  ? `Old v${editingVersion} (view only)`
                  : hasDraft
                    ? `Draft v${editingVersion}${dirty ? " · unsaved" : ""}`
                    : liveVersion != null
                      ? `Live v${liveVersion} (read-only)`
                      : "—"
              }
              tone={hasDraft ? "draft" : "muted"}
            />
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:p-5">
          {actionError ? (
            <p
              role="alert"
              className="rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"
            >
              {actionError}
            </p>
          ) : null}

          {prompts.loading ? (
            <div className="h-[420px] animate-pulse rounded-2xl bg-surface-container-low" />
          ) : prompts.error ? (
            <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 text-center">
              <p className="text-sm text-error">{prompts.error}</p>
              <Button
                variant="ghost"
                className="mt-3 w-auto"
                onClick={() => void prompts.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : showEmpty ? (
            <EmptyPromptState
              onStarter={() => void createDraft(STARTER_SYSTEM_PROMPT)}
            />
          ) : (
            <>
              <div
                className="inline-flex w-full rounded-xl border border-outline-variant bg-surface p-1 sm:w-auto"
                role="tablist"
                aria-label="AI assistant sections"
              >
                {(
                  [
                    ["instructions", "1. Instructions"],
                    ["try", "2. Try it"],
                    ["more", "3. More"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={cn(
                      "min-h-10 flex-1 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none sm:px-4",
                      tab === id
                        ? "bg-background text-on-surface shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "instructions" ? (
                <section className="rounded-2xl border border-outline-variant bg-surface p-4 sm:p-5">
                  {viewingHistory && viewing ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background px-3 py-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-on-surface-variant">
                          Viewing old version
                        </span>
                        <span className="font-semibold tabular-nums text-on-surface">
                          v{viewing.version}
                        </span>
                        <PromptStatusBadge status={viewing.status} />
                      </div>
                      <Button
                        variant="ghost"
                        className="w-auto min-h-9 px-2"
                        onClick={() => {
                          if (prompts.draft) {
                            syncEditorToPrompt(prompts.draft);
                          } else if (prompts.active) {
                            setViewing(null);
                            setEditingId(null);
                            setEditorText(prompts.active.system_prompt);
                          }
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl bg-background px-3 py-2.5 text-sm text-on-surface-variant">
                      {hasDraft ? (
                        <p>
                          <span className="font-medium text-on-surface">
                            Draft
                          </span>{" "}
                          — customers still see the live version until you click{" "}
                          <span className="font-medium text-on-surface">
                            Make live
                          </span>
                          .
                        </p>
                      ) : readOnlyActive ? (
                        <p>
                          This is the{" "}
                          <span className="font-medium text-on-surface">
                            live
                          </span>{" "}
                          version. Click{" "}
                          <span className="font-medium text-on-surface">
                            Edit
                          </span>{" "}
                          to create a draft you can change safely.
                        </p>
                      ) : (
                        <p>Edit the instructions, save, then make them live.</p>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <WritingTips />
                  </div>

                  <AIPromptEditor
                    value={editorText}
                    onChange={(next) => {
                      setEditorText(next);
                      if (saveState === "saved") setSaveState("idle");
                    }}
                    disabled={viewingHistory}
                  />

                  <div className="mt-4 flex flex-col gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="text-xs text-on-surface-variant" role="status">
                      {saveState === "saving"
                        ? "Saving…"
                        : saveState === "saved" && !dirty
                          ? "Draft saved"
                          : dirty
                            ? "You have unsaved changes"
                            : " "}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {viewingHistory && viewing ? (
                        <Button
                          className="sm:w-auto"
                          loading={restoreBusy}
                          onClick={() => void handleRestoreAsDraft(viewing)}
                        >
                          Use this as new draft
                        </Button>
                      ) : readOnlyActive ? (
                        <Button
                          className="sm:w-auto"
                          loading={saveState === "saving"}
                          onClick={() =>
                            void createDraft(
                              editorText ||
                                prompts.active?.system_prompt ||
                                STARTER_SYSTEM_PROMPT,
                            )
                          }
                        >
                          <Icon name="edit" size={18} />
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            className="sm:w-auto"
                            loading={saveState === "saving"}
                            disabled={!dirty && hasDraft}
                            onClick={() => void handleSave()}
                          >
                            <Icon name="save" size={18} />
                            Save draft
                          </Button>
                          <Button
                            className="sm:w-auto"
                            disabled={dirty || !hasDraft || saveState === "saving"}
                            onClick={() => {
                              setActivateError("");
                              setActivateOpen(true);
                            }}
                          >
                            Make live
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              ) : null}

              {tab === "try" ? (
                <AIPreview
                  aiEnabled={settings.settings?.enabled ?? true}
                  activeVersion={liveVersion}
                />
              ) : null}

              {tab === "more" ? (
                <div className="space-y-4">
                  <AICapabilities />
                  <KnowledgeSummaryCard
                    summary={knowledge.summary}
                    loading={knowledge.loading}
                    error={knowledge.error}
                    onRetry={() => void knowledge.refetch()}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Version history"
        description="Open an older version to review it. Restoring creates a new draft."
        size="md"
      >
        <PromptHistory
          items={prompts.items}
          selectedId={viewing?.id ?? editable?.id}
          loading={prompts.loading}
          error={prompts.error}
          onRetry={() => void prompts.refetch()}
          onSelect={(prompt) => {
            if (prompt.status === "DRAFT") {
              syncEditorToPrompt(prompt);
              setHistoryOpen(false);
              setTab("instructions");
              return;
            }
            setViewing(prompt);
            setEditingId(null);
            setEditorText(prompt.system_prompt);
            setHistoryOpen(false);
            setTab("instructions");
          }}
          onRestoreAsDraft={(prompt) => void handleRestoreAsDraft(prompt)}
          restoreBusy={restoreBusy}
        />
      </Dialog>

      <ConfirmDialog
        open={activateOpen}
        title="Make this version live?"
        description="Customers will start getting replies based on this draft."
        confirmLabel="Make live"
        loading={activateBusy}
        error={activateError}
        onClose={() => {
          if (!activateBusy) setActivateOpen(false);
        }}
        onConfirm={() => void handleActivate()}
      />
    </div>
  );
}

function StatusChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "draft" | "muted";
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-background px-3 py-2">
      <p className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-medium",
          tone === "success" && "text-success",
          tone === "warning" && "text-on-surface",
          tone === "draft" && "text-secondary",
          tone === "muted" && "text-on-surface",
        )}
      >
        {value}
      </p>
    </div>
  );
}
