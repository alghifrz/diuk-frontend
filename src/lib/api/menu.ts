import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  CreateCategoryInput,
  CreateMenuItemInput,
  MenuCategory,
  MenuItem,
  MenuStatus,
  UpdateCategoryInput,
  UpdateMenuItemInput,
} from "@/types/menu";

export function listMenuCategories(status?: MenuStatus | "") {
  return apiRequest<MenuCategory[]>(
    `/api/v1/menu/categories${toQuery({ status: status || undefined })}`,
  );
}

export async function listAllMenuCategories() {
  const [active, inactive] = await Promise.all([
    listMenuCategories("ACTIVE"),
    listMenuCategories("INACTIVE"),
  ]);
  return [...active, ...inactive].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
}

export function createMenuCategory(input: CreateCategoryInput) {
  return apiRequest<MenuCategory>("/api/v1/menu/categories", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? null,
      sort_order: input.sort_order ?? 0,
    }),
  });
}

export function updateMenuCategory(id: string, input: UpdateCategoryInput) {
  return apiRequest<MenuCategory>(`/api/v1/menu/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deactivateMenuCategory(id: string) {
  return apiRequest<MenuCategory>(`/api/v1/menu/categories/${id}`, {
    method: "DELETE",
  });
}

export function listMenuItems(params: {
  status?: MenuStatus | "";
  category_id?: string;
} = {}) {
  return apiRequest<MenuItem[]>(
    `/api/v1/menu/items${toQuery({
      status: params.status || undefined,
      category_id: params.category_id,
    })}`,
  );
}

export async function listAllMenuItems(categoryId?: string) {
  const [active, inactive] = await Promise.all([
    listMenuItems({ status: "ACTIVE", category_id: categoryId }),
    listMenuItems({ status: "INACTIVE", category_id: categoryId }),
  ]);
  return [...active, ...inactive].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
}

export function getMenuItem(id: string) {
  return apiRequest<MenuItem>(`/api/v1/menu/items/${id}`);
}

export function createMenuItem(input: CreateMenuItemInput) {
  const form = new FormData();
  form.set("category_id", input.category_id);
  form.set("name", input.name);
  form.set("price", input.price);
  if (input.description != null && input.description !== "") {
    form.set("description", input.description);
  }
  if (input.sort_order != null) {
    form.set("sort_order", String(input.sort_order));
  }
  if (input.image) {
    form.set("image", input.image);
  }
  return apiRequest<MenuItem>("/api/v1/menu/items", {
    method: "POST",
    body: form,
  });
}

export function updateMenuItem(id: string, input: UpdateMenuItemInput) {
  const form = new FormData();
  if (input.name != null) {
    form.set("name", input.name);
  }
  if (input.description !== undefined) {
    form.set("description", input.description ?? "");
  }
  if (input.price != null) {
    form.set("price", input.price);
  }
  if (input.status != null) {
    form.set("status", input.status);
  }
  if (input.sort_order != null) {
    form.set("sort_order", String(input.sort_order));
  }
  if (input.remove_image) {
    form.set("remove_image", "true");
  }
  if (input.image) {
    form.set("image", input.image);
  }
  return apiRequest<MenuItem>(`/api/v1/menu/items/${id}`, {
    method: "PATCH",
    body: form,
  });
}

export function deactivateMenuItem(id: string) {
  return apiRequest<MenuItem>(`/api/v1/menu/items/${id}`, {
    method: "DELETE",
  });
}
