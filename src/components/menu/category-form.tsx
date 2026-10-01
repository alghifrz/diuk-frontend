"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MenuCategory } from "@/types/menu";

type CategoryFormValues = {
  name: string;
  description: string | null;
  sort_order: number;
};

type CategoryFormProps = {
  initial?: MenuCategory | null;
  submitting: boolean;
  error: string;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
};

export function CategoryForm({
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
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
    const order = Number(sortOrder);
    if (!Number.isInteger(order) || order < 0) {
      setLocalError("Sort order must be zero or a positive whole number.");
      return;
    }
    setLocalError("");
    onSubmit({
      name: trimmed,
      description: description.trim() || null,
      sort_order: order,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {localError || error ? (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {localError || error}
        </p>
      ) : null}
      <Input
        label="Category name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Food"
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
      <Input
        label="Sort order"
        type="number"
        min={0}
        step={1}
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
      />
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
          {initial ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
