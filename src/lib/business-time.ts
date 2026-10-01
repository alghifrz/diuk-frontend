/** Business-timezone helpers. Never treat the browser timezone as source of truth. */

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Today's calendar date in the business timezone as YYYY-MM-DD. */
export function businessToday(timeZone: string, now = new Date()): string {
  return formatBusinessDate(now, timeZone);
}

export function formatBusinessDate(date: Date | string, timeZone: string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const parts = zonedParts(value, timeZone);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function formatBusinessTime(date: Date | string, timeZone: string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const parts = zonedParts(value, timeZone);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function formatBusinessDateLabel(dateYmd: string, timeZone: string): string {
  const utc = businessLocalToDate(dateYmd, "12:00", timeZone);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(utc);
}

export function shiftBusinessDate(dateYmd: string, days: number, timeZone: string): string {
  const noon = businessLocalToDate(dateYmd, "12:00", timeZone);
  noon.setUTCDate(noon.getUTCDate() + days);
  return formatBusinessDate(noon, timeZone);
}

/**
 * Convert a business-local wall clock (YYYY-MM-DD + HH:mm) into a UTC Date.
 * Uses iterative offset correction so DST/offset rules of the zone are respected.
 */
export function businessLocalToDate(
  dateYmd: string,
  timeHm: string,
  timeZone: string,
): Date {
  const [year, month, day] = dateYmd.split("-").map(Number);
  const [hour, minute] = timeHm.split(":").map(Number);
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let i = 0; i < 3; i += 1) {
    const parts = zonedParts(new Date(guess), timeZone);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
    guess += desired - asUtc;
  }

  return new Date(guess);
}

export function businessLocalToIso(
  dateYmd: string,
  timeHm: string,
  timeZone: string,
): string {
  return businessLocalToDate(dateYmd, timeHm, timeZone).toISOString();
}

export function addMinutesIso(iso: string, minutes: number): string {
  const date = new Date(iso);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString();
}

export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000,
  );
}
