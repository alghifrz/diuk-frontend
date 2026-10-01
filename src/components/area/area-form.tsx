"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Area } from "@/types/area";

type AreaFormProps = {
  initial?: Area | null;
  submitting: boolean;
  error: string;
  onSubmit: (values: { name: string; description: string | null }) => void;
  onCancel: () => void;
};

export function AreaForm({
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: AreaFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [localError, setLocalError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setLocalError("Name must be at most 100 characters.");
      return;
    }
    setLocalError("");
    onSubmit({
      name: trimmed,
      description: description.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(localError || error) ? (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {localError || error}
        </p>
      ) : null}
      <Input
        label="Area name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Indoor"
        maxLength={100}
        required
        autoFocus
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-on-surface">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Optional"
          className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="sm:w-auto"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="sm:w-auto" loading={submitting}>
          {initial ? "Save changes" : "Create area"}
        </Button>
      </div>
    </form>
  );
}
