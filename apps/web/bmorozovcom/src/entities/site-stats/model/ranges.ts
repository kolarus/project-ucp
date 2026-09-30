/**
 * The stats page's date ranges. Amplitude caches query results itself, and how
 * long depends on the interval and span: about 5 minutes for hourly, an hour
 * for daily up to 7 days, 6 hours up to 30, 18 hours up to 180. Polling faster
 * than that returns the same numbers and only spends rate limit, so our own
 * cache sits just under it.
 */

export type RangeConfig = {
  label: string;
  /** Bucket size: hourly queries refresh in Amplitude every ~5 minutes. */
  granularity: "hour" | "day";
  /** Calendar days queried, counting today. */
  queryDays: number;
  /** How often Amplitude recalculates this query — shown on the page. */
  freshness: string;
  /** Our own cache, in seconds. */
  revalidate: number;
};

export const RANGES = {
  "24h": {
    label: "Last 24 hours",
    granularity: "hour",
    queryDays: 2,
    freshness: "about every 5 minutes",
    revalidate: 60,
  },
  "7d": {
    label: "Last 7 days",
    granularity: "day",
    queryDays: 7,
    freshness: "hourly",
    revalidate: 300,
  },
  "30d": {
    label: "Last 30 days",
    granularity: "day",
    queryDays: 30,
    freshness: "every 6 hours",
    revalidate: 300,
  },
  "90d": {
    label: "Last 90 days",
    granularity: "day",
    queryDays: 90,
    freshness: "every 18 hours",
    revalidate: 300,
  },
} as const satisfies Record<string, RangeConfig>;

export type RangeKey = keyof typeof RANGES;

export function parseRange(value: string | string[] | undefined): RangeKey {
  // Own keys only: `in` would also accept inherited names like `toString`.
  return typeof value === "string" && Object.hasOwn(RANGES, value)
    ? (value as RangeKey)
    : "24h";
}
