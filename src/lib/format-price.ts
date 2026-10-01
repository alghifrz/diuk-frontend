/** Format a menu price for display using the business currency code. */
export function formatMenuPrice(
  price: string | number,
  currency = "IDR",
): string {
  const numeric =
    typeof price === "number" ? price : Number(String(price).replace(/,/g, ""));

  if (!Number.isFinite(numeric)) {
    return String(price);
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

/** Normalize a price input string for the backend (`35000` → `35000`). */
export function normalizePriceInput(raw: string): string {
  return raw.trim().replace(/,/g, "").replace(/\s/g, "");
}
