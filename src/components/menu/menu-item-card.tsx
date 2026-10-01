"use client";

import { useEffect, useState } from "react";
import { EntityStatusBadge } from "@/components/area/status-badge";
import { Icon } from "@/components/ui/icon";
import { formatMenuPrice } from "@/lib/format-price";
import { cn } from "@/lib/cn";
import type { MenuItem } from "@/types/menu";

type MenuItemCardProps = {
  item: MenuItem;
  currency: string;
  priority?: boolean;
  onOpen: () => void;
};

export function MenuItemCard({
  item,
  currency,
  priority = false,
  onOpen,
}: MenuItemCardProps) {
  const active = item.status === "ACTIVE";
  const [useOriginal, setUseOriginal] = useState(false);

  useEffect(() => {
    setUseOriginal(false);
  }, [item.id, item.image_thumb_url, item.image_url]);

  const src = useOriginal
    ? item.image_url
    : item.image_thumb_url || item.image_url;

  return (
    <article
      className={cn(
        "group flex h-[400px] flex-col overflow-hidden rounded-xl border bg-surface transition-colors",
        active
          ? "border-outline-variant hover:border-primary/40"
          : "border-dashed border-outline-variant bg-surface-container-low/50",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex h-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div className="relative h-64 shrink-0 overflow-hidden bg-surface-container-low">
          {src ? (
            // Signed URLs expire; avoid Next/Image remote config binding.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={item.name}
              className="size-full object-cover"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "low"}
              width={512}
              height={512}
              onError={() => {
                if (
                  !useOriginal &&
                  item.image_url &&
                  item.image_url !== src
                ) {
                  setUseOriginal(true);
                }
              }}
            />
          ) : (
            <div
              className="flex size-full items-center justify-center text-on-surface-variant"
              aria-hidden
            >
              <Icon name="image" size={20} />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-0.5 p-2.5">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="line-clamp-1 text-[13px] font-semibold leading-snug text-on-surface">
              {item.name}
            </h3>
            <EntityStatusBadge status={item.status} className="shrink-0" />
          </div>
          <p className="truncate text-[11px] text-on-surface-variant">
            {item.category_name}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <p className="text-[13px] font-semibold tabular-nums text-on-surface">
              {formatMenuPrice(item.price, currency)}
            </p>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Icon name="edit" size={14} />
              Edit
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
