"use client";

import { useState, type FormEvent } from "react";
import { MenuImageUpload } from "@/components/menu/menu-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePriceInput } from "@/lib/format-price";
import type { MenuCategory, MenuItem, MenuStatus } from "@/types/menu";

export type MenuItemFormValues = {
  category_id: string;
  name: string;
  description: string | null;
  price: string;
  sort_order: number;
  status?: MenuStatus;
  image: File | null;
  remove_image: boolean;
};

type MenuItemFormProps = {
  mode: "create" | "edit";
  initial?: MenuItem | null;
  categories: MenuCategory[];
  currency: string;
  submitting: boolean;
  uploadPhase?: "" | "saving" | "uploading";
  error: string;
  onSubmit: (values: MenuItemFormValues) => void;
  onCancel: () => void;
  onCreateCategory?: () => void;
};

export function MenuItemForm({
  mode,
  initial,
  categories,
  currency,
  submitting,
  uploadPhase = "",
  error,
  onSubmit,
  onCancel,
  onCreateCategory,
}: MenuItemFormProps) {
  const activeCategories = categories.filter((item) => item.status === "ACTIVE");
  const [categoryId, setCategoryId] = useState(
    initial?.category_id ?? activeCategories[0]?.id ?? "",
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial ? String(initial.price) : "",
  );
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [status, setStatus] = useState<MenuStatus>(initial?.status ?? "ACTIVE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [localError, setLocalError] = useState("");

  const hasCategories = activeCategories.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Name is required.");
      return;
    }
    if (trimmed.length > 150) {
      setLocalError("Name must be at most 150 characters.");
      return;
    }
    if (mode === "create" && !categoryId) {
      setLocalError("Select a category.");
      return;
    }
    const normalizedPrice = normalizePriceInput(price);
    if (!normalizedPrice || Number.isNaN(Number(normalizedPrice)) || Number(normalizedPrice) < 0) {
      setLocalError("Enter a valid price.");
      return;
    }
    const order = Number(sortOrder);
    if (!Number.isInteger(order) || order < 0) {
      setLocalError("Sort order must be zero or a positive whole number.");
      return;
    }
    setLocalError("");
    onSubmit({
      category_id: categoryId,
      name: trimmed,
      description: description.trim() || null,
      price: normalizedPrice,
      sort_order: order,
      status: mode === "edit" ? status : undefined,
      image: imageFile,
      remove_image: removeImage && !imageFile,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {localError || error ? (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {localError || error}
        </p>
      ) : null}

      {!hasCategories && mode === "create" ? (
        <div className="rounded-2xl border border-outline-variant bg-background px-4 py-3 text-sm text-on-surface">
          <p className="font-medium">Create a category first</p>
          <p className="mt-1 text-on-surface-variant">
            Menu items must belong to an active category.
          </p>
          {onCreateCategory ? (
            <Button
              type="button"
              variant="ghost"
              className="mt-2 w-auto"
              onClick={onCreateCategory}
            >
              Create category
            </Button>
          ) : null}
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
          Basic information
        </h3>
        <Input
          label="Item name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nasi Goreng"
          maxLength={150}
          required
          autoFocus
          disabled={!hasCategories && mode === "create"}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Optional"
            disabled={!hasCategories && mode === "create"}
            className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
          Classification
        </h3>
        {mode === "create" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-on-surface">Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={!hasCategories}
              required
              className="min-h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
            >
              {activeCategories.length === 0 ? (
                <option value="">No categories</option>
              ) : (
                activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </label>
        ) : (
          <div>
            <p className="text-sm font-medium text-on-surface">Category</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              {initial?.category_name ?? "—"}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
          Pricing
        </h3>
        <Input
          label={`Price (${currency})`}
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="35000"
          required
          disabled={!hasCategories && mode === "create"}
        />
        <Input
          label="Sort order"
          type="number"
          min={0}
          step={1}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          disabled={!hasCategories && mode === "create"}
        />
      </section>

      <section>
        <MenuImageUpload
          existingUrl={initial?.image_url}
          existingAlt={initial?.name || name || "Menu item"}
          file={imageFile}
          removeExisting={removeImage}
          disabled={submitting || (!hasCategories && mode === "create")}
          onFileChange={(file) => {
            setImageFile(file);
            setRemoveImage(false);
          }}
          onClearSelection={() => setImageFile(null)}
          onRemoveExisting={() => {
            setImageFile(null);
            setRemoveImage(true);
          }}
        />
      </section>

      {mode === "edit" ? (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
            Status
          </h3>
          <div
            className="inline-flex rounded-xl border border-outline-variant bg-background p-0.5"
            role="group"
            aria-label="Item status"
          >
            {(["ACTIVE", "INACTIVE"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  status === value
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {value === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="sm:w-auto"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="sm:w-auto"
          loading={submitting}
          disabled={!hasCategories && mode === "create"}
        >
          {uploadPhase === "uploading"
            ? "Uploading image..."
            : uploadPhase === "saving"
              ? "Saving..."
              : initial
                ? "Save changes"
                : "Create item"}
        </Button>
      </div>
    </form>
  );
}
