"use client";

import { useState } from "react";
import { TableForm } from "@/components/area/table-form";
import { Dialog } from "@/components/reservations/dialog";
import { areaErrorMessage } from "@/lib/area-errors";
import type { DiningTable } from "@/types/area";

type TableDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  areaName: string;
  table?: DiningTable | null;
  onClose: () => void;
  onCreate: (input: { name: string; capacity: number }) => Promise<DiningTable>;
  onUpdate: (
    id: string,
    input: { name: string; capacity: number },
  ) => Promise<DiningTable>;
  onSaved: (table: DiningTable) => void;
};

export function TableDialog({
  open,
  mode,
  areaName,
  table,
  onClose,
  onCreate,
  onUpdate,
  onSaved,
}: TableDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: { name: string; capacity: number }) {
    setSubmitting(true);
    setError("");
    try {
      const saved =
        mode === "edit" && table
          ? await onUpdate(table.id, values)
          : await onCreate(values);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(
        areaErrorMessage(
          err,
          mode === "edit" ? "Couldn't update table." : "Couldn't create table.",
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
      title={mode === "edit" ? "Edit table" : "Add table"}
      description={
        mode === "edit"
          ? "Update the table name or seating capacity."
          : `New tables are created under ${areaName}.`
      }
    >
      <TableForm
        key={table?.id ?? `create-${areaName}`}
        initial={mode === "edit" ? table : null}
        areaName={areaName}
        submitting={submitting}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={onClose}
      />
    </Dialog>
  );
}
