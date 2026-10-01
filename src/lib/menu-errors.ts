import { ApiError } from "@/lib/api/errors";

const MESSAGES: Record<string, string> = {
  CATEGORY_NAME_ALREADY_EXISTS: "A category with this name already exists.",
  CATEGORY_HAS_ACTIVE_ITEMS:
    "This category still has active menu items. Deactivate those items first.",
  CATEGORY_NOT_FOUND: "Category not found.",
  MENU_ITEM_NOT_FOUND: "Menu item not found.",
  MENU_ITEM_CATEGORY_INVALID:
    "The selected category is not valid for this item.",
  INVALID_PRICE: "Enter a valid price.",
  INVALID_SORT_ORDER: "Sort order must be zero or a positive number.",
  INVALID_IMAGE_TYPE: "Unsupported image format. Use JPG, PNG, or WebP.",
  IMAGE_TOO_LARGE: "Image must be 5 MB or smaller.",
  IMAGE_UPLOAD_FAILED: "The image couldn't be uploaded.",
  IMAGE_DELETE_FAILED: "The image couldn't be removed.",
  IMAGE_SIGNED_URL_FAILED: "Couldn't load the menu image.",
};

export function menuErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) {
      return MESSAGES[error.code];
    }
    if (error.code === "BAD_REQUEST" && error.message) {
      return error.message;
    }
    if (error.status === 401) {
      return "Your session expired. Please sign in again.";
    }
    if (error.status === 403) {
      return "You do not have permission to do that.";
    }
  }

  return fallback;
}

export const MENU_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const MENU_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function validateMenuImageFile(file: File): string | null {
  const type = file.type.toLowerCase();
  if (
    !MENU_IMAGE_TYPES.includes(type as (typeof MENU_IMAGE_TYPES)[number]) &&
    !/\.(jpe?g|png|webp)$/i.test(file.name)
  ) {
    return "Please upload a JPG, PNG, or WebP image.";
  }
  if (file.size > MENU_IMAGE_MAX_BYTES) {
    return "Image size must be 5 MB or smaller.";
  }
  return null;
}
