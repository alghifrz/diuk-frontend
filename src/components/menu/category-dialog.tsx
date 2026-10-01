"use client";

import { useState } from "react";
import { CategoryForm } from "@/components/menu/category-form";
import { ConfirmDialog } from "@/components/area/confirm-dialog";
import { EntityStatusBadge } from "@/components/area/status-badge";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { menuErrorMessage } from "@/lib/menu-errors";
import type {
  CreateCategoryInput,
  MenuCategory,
  UpdateCategoryInput,
} from "@/types/menu";

type CategoryDialogProps = {
  open: boolean;
  categories: MenuCategory[];
  onClose: () => void;
  onCreate: (input: CreateCategoryInput) => Promise<MenuCategory>;
  onUpdate: (id: string, input: UpdateCategoryInput) => Promise<MenuCategory>;
  onDeactivate: (id: string) => Promise<MenuCategory>;
  onChanged: () => void;
};

export function CategoryDialog({
  open,
  categories,
  onClose,
  onCreate,
  onUpdate,
  onDeactivate,
  onChanged,
}: CategoryDialogProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<MenuCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<MenuCategory | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  function resetForm() {
    setMode("list");
    setEditing(null);
    setError("");
  }

  async function handleSubmit(values: {
    name: string;
    description: string | null;
    sort_order: number;
  }) {
    setSubmitting(true);
    setError("");
    try {
      if (mode === "edit" && editing) {
        await onUpdate(editing.id, values);
      } else {
        await onCreate(values);
      }
      onChanged();
      resetForm();
    } catch (err) {
      setError(
        menuErrorMessage(
          err,
          mode === "edit"
            ? "Couldn't update category."
            : "Couldn't create category.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm) {
      return;
    }
    setConfirmBusy(true);
    setConfirmError("");
    try {
      await onDeactivate(confirm.id);
      onChanged();
      setConfirm(null);
    } catch (err) {
      setConfirmError(
        menuErrorMessage(err, "Couldn't deactivate category."),
      );
    } finally {
      setConfirmBusy(false);
    }
  }

  async function handleReactivate(category: MenuCategory) {
    setError("");
    try {
      await onUpdate(category.id, { status: "ACTIVE" });
      onChanged();
    } catch (err) {
      setError(menuErrorMessage(err, "Couldn't reactivate category."));
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          if (!submitting) {
            resetForm();
            onClose();
          }
        }}
        title={
          mode === "create"
            ? "Add category"
            : mode === "edit"
              ? "Edit category"
              : "Manage categories"
        }
        description={
          mode === "list"
            ? "Organize items into categories."
            : "Name and optional description."
        }
        size="lg"
      >
        {mode === "list" ? (
          <div className="space-y-4">
            {error ? (
              <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end">
              <Button
                className="w-auto"
                onClick={() => {
                  setEditing(null);
                  setError("");
                  setMode("create");
                }}
              >
                <Icon name="add" size={18} />
                Add Category
              </Button>
            </div>
            {categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant px-4 py-10 text-center">
                <p className="text-sm font-semibold text-on-surface">
                  No categories yet
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Create a category to organize your menu.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-outline-variant rounded-2xl border border-outline-variant">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {category.name}
                        </p>
                        <EntityStatusBadge status={category.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        {category.active_item_count} active · {category.item_count}{" "}
                        total
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        className="w-auto min-h-9 min-w-0 px-2.5"
                        onClick={() => {
                          setEditing(category);
                          setError("");
                          setMode("edit");
                        }}
                      >
                        <Icon name="edit" size={16} />
                        Edit
                      </Button>
                      {category.status === "ACTIVE" ? (
                        <Button
                          variant="ghost"
                          className="w-auto min-h-9 min-w-0 px-2.5"
                          onClick={() => {
                            setConfirmError("");
                            setConfirm(category);
                          }}
                        >
                          <Icon name="block" size={16} />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-auto min-h-9 min-w-0 px-2.5"
                          onClick={() => void handleReactivate(category)}
                        >
                          <Icon name="check_circle" size={16} />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <CategoryForm
            key={editing?.id ?? "create"}
            initial={mode === "edit" ? editing : null}
            submitting={submitting}
            error={error}
            onSubmit={(values) => void handleSubmit(values)}
            onCancel={resetForm}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm
            ? `Deactivate ${confirm.name}?`
            : "Deactivate category?"
        }
        description="The category will no longer be available for new menu items. Existing items are not deleted."
        confirmLabel="Deactivate"
        destructive
        loading={confirmBusy}
        error={confirmError}
        onClose={() => {
          if (!confirmBusy) {
            setConfirm(null);
          }
        }}
        onConfirm={() => void handleDeactivate()}
      />
    </>
  );
}
