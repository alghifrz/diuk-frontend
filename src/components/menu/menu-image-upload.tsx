"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { validateMenuImageFile } from "@/lib/menu-errors";
import { cn } from "@/lib/cn";

type MenuImageUploadProps = {
  existingUrl?: string | null;
  existingAlt?: string;
  file: File | null;
  removeExisting: boolean;
  disabled?: boolean;
  error?: string;
  onFileChange: (file: File | null) => void;
  onRemoveExisting: () => void;
  onClearSelection: () => void;
};

export function MenuImageUpload({
  existingUrl,
  existingAlt = "Menu item",
  file,
  removeExisting,
  disabled = false,
  error = "",
  onFileChange,
  onRemoveExisting,
  onClearSelection,
}: MenuImageUploadProps) {
  const [localError, setLocalError] = useState("");

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const shownUrl = previewUrl ?? (!removeExisting ? existingUrl : null);

  function handlePick(next: FileList | null) {
    const selected = next?.[0];
    if (!selected) {
      return;
    }
    const validation = validateMenuImageFile(selected);
    if (validation) {
      setLocalError(validation);
      onFileChange(null);
      return;
    }
    setLocalError("");
    onFileChange(selected);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-on-surface">Image</p>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-outline-variant bg-background",
          disabled ? "opacity-60" : undefined,
        )}
      >
        <div className="relative aspect-[4/3] bg-surface-container-low">
          {shownUrl ? (
            // Signed URL from backend; avoid Next Image remote config coupling.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownUrl}
              alt={existingAlt}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Icon name="image" size={28} />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-outline-variant p-3">
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-outline-variant bg-surface px-3 text-sm font-medium text-on-surface transition-colors hover:bg-background focus-within:ring-2 focus-within:ring-primary">
            {shownUrl ? "Change image" : "Choose image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                handlePick(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {file ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setLocalError("");
                onClearSelection();
              }}
              className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-medium text-on-surface-variant transition-colors hover:bg-background hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Clear selection
            </button>
          ) : null}
          {!file && existingUrl && !removeExisting ? (
            <button
              type="button"
              disabled={disabled}
              onClick={onRemoveExisting}
              className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-medium text-error transition-colors hover:bg-error/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Remove image
            </button>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-on-surface-variant">
        JPG, PNG, or WebP · max 5 MB
      </p>
      {localError || error ? (
        <p role="alert" className="text-sm text-error">
          {localError || error}
        </p>
      ) : null}
    </div>
  );
}
