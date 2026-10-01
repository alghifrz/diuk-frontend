"use client";

import { useState } from "react";
import { AreaForm } from "@/components/area/area-form";
import { Dialog } from "@/components/reservations/dialog";
import { areaErrorMessage } from "@/lib/area-errors";
import type { Area } from "@/types/area";

type AreaDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  area?: Area | null;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description: string | null;
  }) => Promise<Area>;
  onUpdate: (
    id: string,
    input: { name: string; description: string | null },
  ) => Promise<Area>;
  onSaved: (area: Area) => void;
};

export function AreaDialog({
  open,
  mode,
  area,
  onClose,
  onCreate,
  onUpdate,
  onSaved,
}: AreaDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: {
    name: string;
    description: string | null;
  }) {
    setSubmitting(true);
    setError("");
    try {
      const saved =
        mode === "edit" && area
          ? await onUpdate(area.id, values)
          : await onCreate(values);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(
        areaErrorMessage(
          err,
          mode === "edit" ? "Couldn't update area." : "Couldn't create area.",
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
      title={mode === "edit" ? "Edit area" : "Add area"}
      description={
        mode === "edit"
          ? "Update the area name or description."
          : "Create a dining area to organize tables."
      }
    >
      <AreaForm
        key={area?.id ?? "create"}
        initial={mode === "edit" ? area : null}
        submitting={submitting}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={onClose}
      />
    </Dialog>
  );
}
