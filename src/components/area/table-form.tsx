"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DiningTable } from "@/types/area";

type TableFormProps = {
  initial?: DiningTable | null;
  areaName: string;
  submitting: boolean;
  error: string;
  onSubmit: (values: { name: string; capacity: number }) => void;
  onCancel: () => void;
};

export function TableForm({
  initial,
  areaName,
  submitting,
  error,
  onSubmit,
  onCancel,
}: TableFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 4));
  const [localError, setLocalError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    const seats = Number(capacity);

    if (!trimmed) {
      setLocalError("Name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setLocalError("Name must be at most 100 characters.");
      return;
    }
    if (!Number.isFinite(seats) || seats < 1 || !Number.isInteger(seats)) {
      setLocalError("Capacity must be a whole number of at least 1.");
      return;
    }

    setLocalError("");
    onSubmit({ name: trimmed, capacity: seats });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-xl bg-background px-3 py-2 text-sm text-on-surface-variant">
        Area: <span className="font-medium text-on-surface">{areaName}</span>
      </p>
      {(localError || error) ? (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {localError || error}
        </p>
      ) : null}
      <Input
        label="Table name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Table 1"
        maxLength={100}
        required
        autoFocus
      />
      <Input
        label="Capacity (seats)"
        type="number"
        min={1}
        step={1}
        value={capacity}
        onChange={(event) => setCapacity(event.target.value)}
        required
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
          {initial ? "Save changes" : "Create table"}
        </Button>
      </div>
    </form>
  );
}
