"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/area/confirm-dialog";
import { EntityStatusBadge } from "@/components/area/status-badge";
import {
  MenuItemForm,
  type MenuItemFormValues,
} from "@/components/menu/menu-item-form";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatMenuPrice } from "@/lib/format-price";
import { menuErrorMessage } from "@/lib/menu-errors";
import type {
  CreateMenuItemInput,
  MenuCategory,
  MenuItem,
  UpdateMenuItemInput,
} from "@/types/menu";

type MenuItemDialogProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  item?: MenuItem | null;
  categories: MenuCategory[];
  currency: string;
  onClose: () => void;
  onCreate: (input: CreateMenuItemInput) => Promise<MenuItem>;
  onUpdate: (id: string, input: UpdateMenuItemInput) => Promise<MenuItem>;
  onDeactivate: (id: string) => Promise<MenuItem>;
  onSaved: (item: MenuItem) => void;
  onCreateCategory?: () => void;
};

export function MenuItemDialog({
  open,
  mode,
  item,
  categories,
  currency,
  onClose,
  onCreate,
  onUpdate,
  onDeactivate,
  onSaved,
  onCreateCategory,
}: MenuItemDialogProps) {
  const [editing, setEditing] = useState(mode === "create" || mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"" | "saving" | "uploading">("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const showForm = mode === "create" || editing;

  async function handleSubmit(values: MenuItemFormValues) {
    setSubmitting(true);
    setError("");
    const hasImage = Boolean(values.image);
    setUploadPhase(hasImage ? "uploading" : "saving");
    try {
      let saved: MenuItem;
      if (mode !== "create" && item) {
        const input: UpdateMenuItemInput = {
          name: values.name,
          description: values.description,
          price: values.price,
          sort_order: values.sort_order,
          status: values.status,
          image: values.image,
          remove_image: values.remove_image,
        };
        saved = await onUpdate(item.id, input);
      } else {
        saved = await onCreate({
          category_id: values.category_id,
          name: values.name,
          description: values.description,
          price: values.price,
          sort_order: values.sort_order,
          image: values.image,
        });
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      const fallback =
        mode === "create"
          ? hasImage
            ? "The image couldn't be uploaded. The menu item was not created."
            : "Couldn't create menu item."
          : hasImage
            ? "The image couldn't be uploaded. The menu item was not changed."
            : "Couldn't update menu item.";
      setError(menuErrorMessage(err, fallback));
    } finally {
      setSubmitting(false);
      setUploadPhase("");
    }
  }

  async function handleDeactivate() {
    if (!item) {
      return;
    }
    setConfirmBusy(true);
    setConfirmError("");
    try {
      const updated = await onDeactivate(item.id);
      onSaved(updated);
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      setConfirmError(menuErrorMessage(err, "Couldn't deactivate menu item."));
    } finally {
      setConfirmBusy(false);
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          if (!submitting) {
            onClose();
          }
        }}
        title={
          mode === "create"
            ? "Add menu item"
            : showForm
              ? "Edit menu item"
              : item?.name ?? "Menu item"
        }
        description={
          mode === "create"
            ? "Add an item with price and optional image."
            : showForm
              ? "Update details, price, or image."
              : undefined
        }
        size="lg"
      >
        {showForm ? (
          <MenuItemForm
            key={item?.id ?? "create"}
            mode={mode === "create" ? "create" : "edit"}
            initial={mode === "create" ? null : item}
            categories={categories}
            currency={currency}
            submitting={submitting}
            uploadPhase={uploadPhase}
            error={error}
            onSubmit={(values) => void handleSubmit(values)}
            onCancel={onClose}
            onCreateCategory={onCreateCategory}
          />
        ) : item ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-outline-variant bg-background">
              <div className="relative aspect-[16/10] bg-surface-container-low">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-on-surface-variant">
                    <Icon name="image" size={32} />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-on-surface">
                    {item.name}
                  </h3>
                  <EntityStatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {item.category_name}
                </p>
              </div>
              <p className="text-base font-semibold tabular-nums text-on-surface">
                {formatMenuPrice(item.price, currency)}
              </p>
            </div>

            {item.description ? (
              <p className="text-sm leading-6 text-on-surface-variant">
                {item.description}
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant">No description</p>
            )}

            <div className="flex flex-col gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
              {item.status === "ACTIVE" ? (
                <Button
                  variant="ghost"
                  className="sm:w-auto"
                  onClick={() => {
                    setConfirmError("");
                    setConfirmOpen(true);
                  }}
                >
                  <Icon name="block" size={18} />
                  Deactivate
                </Button>
              ) : null}
              <Button
                className="sm:w-auto"
                onClick={() => {
                  setError("");
                  setEditing(true);
                }}
              >
                <Icon name="edit" size={18} />
                Edit
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title={item ? `Deactivate ${item.name}?` : "Deactivate item?"}
        description="This item will no longer be active in the menu."
        confirmLabel="Deactivate"
        destructive
        loading={confirmBusy}
        error={confirmError}
        onClose={() => {
          if (!confirmBusy) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={() => void handleDeactivate()}
      />
    </>
  );
}
