"use client";

import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  destructive?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  destructive = false,
  error = "",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            className="sm:w-auto"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            className="sm:w-auto"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {error ? (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}
    </Dialog>
  );
}
