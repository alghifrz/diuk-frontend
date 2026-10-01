"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { askKnowledge } from "@/lib/api/knowledge";
import { cn } from "@/lib/cn";
import { knowledgeErrorMessage } from "@/lib/knowledge-errors";
import type { KnowledgeAnswer } from "@/types/knowledge";

const EXAMPLES = [
  "Jam berapa buka?",
  "Boleh bawa peliharaan?",
  "Ada area parkir?",
];

function similarityTone(value: number) {
  if (value >= 0.5) return "bg-success/15 text-success";
  if (value >= 0.35) return "bg-warning/20 text-warning";
  return "bg-surface-container-low text-on-surface-variant";
}

/** Ask a question the way a guest would and see the answer the AI would give. */
export function TestPanel({
  enabled,
  hasReadyDocuments,
}: {
  enabled: boolean;
  hasReadyDocuments: boolean;
}) {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");
  const [result, setResult] = useState<KnowledgeAnswer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);

  async function run(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError("");
    try {
      const out = await askKnowledge(trimmed);
      setResult(out);
      setAsked(trimmed);
      setShowSources(false);
    } catch (err) {
      setResult(null);
      setError(knowledgeErrorMessage(err, "Couldn't get an answer."));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void run(query);
  }

  const disabled = !enabled || !hasReadyDocuments;

  return (
    <section className="rounded-[1.5rem] border border-outline-variant bg-surface/90 p-5 shadow-[0_12px_40px_-28px_rgba(30,36,48,0.35)] sm:p-6">
      <h2 className="text-base font-semibold tracking-tight text-on-surface">
        Try a question
      </h2>
      <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">
        Ask like a guest would and see the answer the AI gives from your
        documents.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label htmlFor="knowledge-query" className="sr-only">
          Question
        </label>
        <input
          id="knowledge-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled}
          maxLength={500}
          placeholder="Ask like a guest would…"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-background"
        />
        {/* Native button: the shared Button is w-full and `cn` doesn't resolve w-auto against it. */}
        <button
          type="submit"
          disabled={disabled || loading || !query.trim()}
          aria-busy={loading || undefined}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary"
        >
          <Icon
            name={loading ? "progress_activity" : "send"}
            size={18}
            className={loading ? "animate-spin" : undefined}
          />
          <span className="sr-only sm:not-sr-only">Ask</span>
        </button>
      </form>

      {disabled ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          {!enabled
            ? "Questions are unavailable until knowledge is switched on for this server."
            : "Add a document and wait for it to be Ready to try questions here."}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                void run(example);
              }}
              className="rounded-full border border-outline-variant px-3 py-1 text-xs text-on-surface-variant transition-colors hover:border-primary/50 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="mt-4 space-y-3">
        {error ? (
          <p className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
        ) : null}

        {result && !result.available ? (
          <p className="rounded-xl border border-dashed border-outline-variant px-4 py-5 text-center text-sm text-on-surface-variant">
            Answers aren&apos;t available right now.
          </p>
        ) : null}

        {result?.available ? (
          <>
            <p className="text-xs text-on-surface-variant">
              <span className="font-medium text-on-surface">{asked}</span>
            </p>

            {result.found && result.answer ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-primary-dark uppercase">
                  <Icon name="auto_awesome" size={14} />
                  AI answer
                </p>
                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-on-surface">
                  {result.answer}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant px-4 py-5 text-center">
                <p className="text-sm font-medium text-on-surface">
                  No answer in your documents
                </p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  The AI would tell the guest it doesn&apos;t have that
                  information. Add a document that covers it.
                </p>
              </div>
            )}

            {result.sources.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSources((open) => !open)}
                  aria-expanded={showSources}
                  className="inline-flex items-center gap-1 rounded-lg py-1 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon
                    name={showSources ? "expand_less" : "expand_more"}
                    size={18}
                  />
                  {showSources ? "Hide" : "Show"} where it came from (
                  {result.sources.length})
                </button>
                {showSources ? (
                  <div className="mt-2 space-y-2.5">
                    {result.sources.map((hit) => (
                      <article
                        key={hit.chunk_id}
                        className="rounded-xl border border-outline-variant bg-background/60 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 truncate text-sm font-semibold text-on-surface">
                            {hit.title}
                          </h3>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                              similarityTone(hit.similarity),
                            )}
                            title="How closely this passage matches the question"
                          >
                            {Math.round(hit.similarity * 100)}% match
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-6 text-sm leading-6 whitespace-pre-wrap text-on-surface-variant">
                          {hit.content}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
