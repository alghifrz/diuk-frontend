export type MenuStatus = "ACTIVE" | "INACTIVE";

export type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  status: MenuStatus;
  sort_order: number;
  item_count: number;
  active_item_count: number;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string | null;
  price: string | number;
  image_path: string | null;
  image_url: string | null;
  image_thumb_url: string | null;
  status: MenuStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
  sort_order?: number;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string | null;
  status?: MenuStatus;
  sort_order?: number;
};

export type CreateMenuItemInput = {
  category_id: string;
  name: string;
  description?: string | null;
  price: string;
  sort_order?: number;
  image?: File | null;
};

export type UpdateMenuItemInput = {
  name?: string;
  description?: string | null;
  price?: string;
  status?: MenuStatus;
  sort_order?: number;
  image?: File | null;
  remove_image?: boolean;
};

export type StatusFilter = "ACTIVE" | "ALL";
