"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryDialog } from "@/components/menu/category-dialog";
import {
  CategoryChips,
  CategorySidebar,
} from "@/components/menu/category-sidebar";
import { MenuGrid } from "@/components/menu/menu-grid";
import { MenuItemDialog } from "@/components/menu/menu-item-dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useBusinessContext } from "@/hooks/use-business-context";
import { useMenuCategories } from "@/hooks/use-menu-categories";
import { useMenuItems } from "@/hooks/use-menu-items";
import { cn } from "@/lib/cn";
import type { MenuItem, StatusFilter } from "@/types/menu";

export function MenuWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const business = useBusinessContext();
  const currency = business.fnb?.currency || "IDR";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [search, setSearch] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogKey, setCategoryDialogKey] = useState(0);
  const [itemDialog, setItemDialog] = useState<"create" | "edit" | "view" | null>(
    null,
  );
  const [itemDialogKey, setItemDialogKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const categories = useMenuCategories("ALL");
  const items = useMenuItems({
    categoryId,
    statusFilter,
    search,
  });

  const selectedCategory = useMemo(
    () => categories.items.find((item) => item.id === categoryId) ?? null,
    [categories.items, categoryId],
  );

  const invalidCategory =
    Boolean(categoryId) &&
    !categories.loading &&
    !categories.error &&
    !selectedCategory;

  const selectCategory = useCallback(
    (id: string | null) => {
      if (id) {
        router.replace(`/menu?category=${id}`, { scroll: false });
      } else {
        router.replace("/menu", { scroll: false });
      }
    },
    [router],
  );

  const openCreateItem = useCallback(() => {
    setSelectedItem(null);
    setItemDialogKey((key) => key + 1);
    setItemDialog("create");
  }, []);

  const openManageCategories = useCallback(() => {
    setCategoryDialogKey((key) => key + 1);
    setCategoryDialogOpen(true);
  }, []);

  const emptyTitle = invalidCategory
    ? "Category not found"
    : selectedCategory
      ? "No items in this category"
      : "No menu items";

  const emptyDescription = invalidCategory
    ? "This category does not exist or is no longer available."
    : selectedCategory
      ? "Try another category or add a new menu item."
      : "Add your first menu item to start building your menu.";

  const emptyActionLabel =
    !invalidCategory && categories.items.some((c) => c.status === "ACTIVE")
      ? "Add Item"
      : categories.items.length === 0
        ? "Add Category"
        : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-on-surface lg:text-lg">
            Menu
          </h2>
          <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
            Manage your menu, categories, prices, and item images.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="w-auto min-w-0 px-3"
            onClick={openManageCategories}
          >
            <Icon name="category" size={18} />
            <span className="hidden sm:inline">Manage Categories</span>
            <span className="sm:hidden">Categories</span>
          </Button>
          <Button className="w-auto min-w-0 px-3 sm:px-4" onClick={openCreateItem}>
            <Icon name="add" size={18} />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-outline-variant bg-surface lg:block xl:w-64">
          <CategorySidebar
            categories={categories.items}
            selectedId={invalidCategory ? null : categoryId}
            loading={categories.loading}
            error={categories.error}
            onSelect={selectCategory}
            onRetry={() => void categories.refetch()}
            onManage={openManageCategories}
          />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="space-y-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
            <div className="lg:hidden">
              <CategoryChips
                categories={categories.items}
                selectedId={invalidCategory ? null : categoryId}
                loading={categories.loading}
                onSelect={selectCategory}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search menu</span>
                <Icon
                  name="search"
                  size={18}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search menu..."
                  className="min-h-10 w-full rounded-xl border border-outline-variant bg-background py-2 pr-3 pl-10 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </label>
              <div
                className="inline-flex rounded-xl border border-outline-variant bg-background p-0.5"
                role="group"
                aria-label="Item status filter"
              >
                {(["ACTIVE", "ALL"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={cn(
                      "min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      statusFilter === value
                        ? "bg-surface text-on-surface shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {value === "ACTIVE" ? "Active" : "All"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {categories.error && !categories.loading ? (
              <p
                role="alert"
                className="mb-4 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"
              >
                {categories.error}
              </p>
            ) : null}

            {!categories.loading &&
            !categories.error &&
            categories.items.length === 0 &&
            !items.loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                  <Icon name="category" size={24} />
                </span>
                <p className="mt-4 text-sm font-semibold text-on-surface">
                  No categories yet
                </p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-on-surface-variant">
                  Create a category to organize your menu.
                </p>
                <div className="mt-5 w-full max-w-[160px]">
                  <Button onClick={openManageCategories}>
                    <Icon name="add" size={18} />
                    Add Category
                  </Button>
                </div>
              </div>
            ) : (
              <MenuGrid
                items={invalidCategory ? [] : items.items}
                currency={currency}
                loading={items.loading || categories.loading}
                error={invalidCategory ? "" : items.error}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                emptyActionLabel={emptyActionLabel}
                onEmptyAction={
                  emptyActionLabel === "Add Category"
                    ? openManageCategories
                    : emptyActionLabel === "Add Item"
                      ? openCreateItem
                      : undefined
                }
                onRetry={() => void items.refetch()}
                onOpen={(item) => {
                  setSelectedItem(item);
                  setItemDialogKey((key) => key + 1);
                  setItemDialog("view");
                }}
              />
            )}
          </div>
        </section>
      </div>

      <CategoryDialog
        key={`category-dialog-${categoryDialogKey}`}
        open={categoryDialogOpen}
        categories={categories.items}
        onClose={() => setCategoryDialogOpen(false)}
        onCreate={categories.create}
        onUpdate={categories.update}
        onDeactivate={categories.deactivate}
        onChanged={() => {
          void categories.refetch();
          void items.refetch();
        }}
      />

      <MenuItemDialog
        key={`item-dialog-${itemDialogKey}`}
        open={itemDialog !== null}
        mode={itemDialog === "create" ? "create" : itemDialog === "edit" ? "edit" : "view"}
        item={itemDialog === "create" ? null : selectedItem}
        categories={categories.items}
        currency={currency}
        onClose={() => {
          setItemDialog(null);
          setSelectedItem(null);
        }}
        onCreate={items.create}
        onUpdate={items.update}
        onDeactivate={items.deactivate}
        onSaved={() => {
          void items.refetch();
          void categories.refetch();
        }}
        onCreateCategory={() => {
          setItemDialog(null);
          openManageCategories();
        }}
      />
    </div>
  );
}
