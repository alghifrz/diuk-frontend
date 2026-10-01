import type { DateRange } from "@/lib/analytics-report";

export type TabProps = {
  range: DateRange;
  /** Equal-length window right before `range`, for period-over-period deltas. */
  previous: DateRange;
  currency: string;
  /** Used to name exported files. */
  rangeSlug: string;
};
