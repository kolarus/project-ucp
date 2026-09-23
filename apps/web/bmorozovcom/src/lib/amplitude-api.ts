import "server-only";

/**
 * Read side of Amplitude: the Dashboard REST API's event segmentation, queried
 * from the server with the project's secret key — which must never reach the
 * browser, hence `server-only`.
 *
 * Amplitude caches query results itself, and how long depends on the interval
 * and span: about 5 minutes for hourly, an hour for daily up to 7 days, 6 hours
 * up to 30, 18 hours up to 180. Polling faster than that returns the same
 * numbers and only spends rate limit, so our own cache sits just under it.
 *
 * Needs `NEXT_PUBLIC_AMPLITUDE_API_KEY` (the same key the browser uses, inlined
 * at build) and `AMPLITUDE_SECRET_KEY` (runtime only). Without both, stats
 * report `unconfigured` rather than failing.
 */

type RangeConfig = {
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

type EventQuery = {
  event_type: string;
  group_by?: { type: "event"; value: string }[];
};

type SegmentationData = {
  series: number[][];
  /** Grouped values: plain strings, or `[index, value]` pairs. */
  seriesLabels: unknown[];
  /** Bucket starts in the project's timezone (UTC here). */
  xValues: string[];
};

/** Counts per bucket — a day, or an hour for the 24-hour range. */
export type Series = { buckets: string[]; values: number[]; total: number };

export type SiteStats =
  | { status: "unconfigured" }
  | { status: "error" }
  | {
      status: "ok";
      pageViews: Series;
      cvDownloads: Series;
      /** Contact clicks keyed by `type` (email, linkedin, …). */
      contactClicks: Record<string, Series>;
    };

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE === "EU"
    ? "https://analytics.eu.amplitude.com"
    : "https://amplitude.com";
}

/** Inclusive UTC date span ending today, as Amplitude's `YYYYMMDD`. */
function dateSpan(days: number) {
  const format = (date: Date) =>
    date.toISOString().slice(0, 10).replaceAll("-", "");
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * 86_400_000);
  return { start: format(start), end: format(end) };
}

async function segmentation(
  event: EventQuery,
  range: RangeConfig,
  auth: string,
): Promise<SegmentationData> {
  const { start, end } = dateSpan(range.queryDays);
  const params = new URLSearchParams({
    e: JSON.stringify(event),
    start,
    end,
    // Amplitude's interval codes: -3600000 hourly, 1 daily.
    i: range.granularity === "hour" ? "-3600000" : "1",
    m: "totals",
  });

  const response = await fetch(
    `${apiBaseUrl()}/api/2/events/segmentation?${params}`,
    {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: range.revalidate },
    },
  );
  if (!response.ok) {
    throw new Error(`Amplitude segmentation ${response.status}`);
  }
  return ((await response.json()) as { data: SegmentationData }).data;
}

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/**
 * Bucket indices to keep. Hourly queries cover yesterday and today in full,
 * future hours included, so trim to the 24 hours ending with the current one.
 */
function visibleBuckets(data: SegmentationData, range: RangeConfig) {
  const all = data.xValues.map((_, index) => index);
  if (range.granularity !== "hour") return all;

  const currentHour = new Date();
  currentHour.setUTCMinutes(0, 0, 0);
  const first = currentHour.getTime() - 23 * 3_600_000;
  return all.filter((index) => {
    const start = Date.parse(`${data.xValues[index]}Z`);
    return start >= first && start <= currentHour.getTime();
  });
}

function toSeries(
  data: SegmentationData,
  values: readonly number[] | undefined,
  keep: readonly number[],
): Series {
  const kept = keep.map((index) => values?.[index] ?? 0);
  return {
    buckets: keep.map((index) => data.xValues[index] ?? ""),
    values: kept,
    total: sum(kept),
  };
}

function labelText(label: unknown) {
  const value = Array.isArray(label) ? label[label.length - 1] : label;
  return String(value ?? "");
}

export async function getSiteStats(rangeKey: RangeKey): Promise<SiteStats> {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  const secretKey = process.env.AMPLITUDE_SECRET_KEY;
  if (!apiKey || !secretKey) return { status: "unconfigured" };

  const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const range: RangeConfig = RANGES[rangeKey];

  try {
    const [pageViews, cvDownloads, contactClicks] = await Promise.all([
      segmentation({ event_type: "[Amplitude] Page Viewed" }, range, auth),
      segmentation({ event_type: "cv_downloaded" }, range, auth),
      // Grouped by channel with no `action` filter, so copying the email
      // address counts as an email click.
      segmentation(
        {
          event_type: "contact_clicked",
          group_by: [{ type: "event", value: "type" }],
        },
        range,
        auth,
      ),
    ]);

    return {
      status: "ok",
      pageViews: toSeries(
        pageViews,
        pageViews.series[0],
        visibleBuckets(pageViews, range),
      ),
      cvDownloads: toSeries(
        cvDownloads,
        cvDownloads.series[0],
        visibleBuckets(cvDownloads, range),
      ),
      contactClicks: Object.fromEntries(
        contactClicks.seriesLabels.map((label, index) => [
          labelText(label),
          toSeries(
            contactClicks,
            contactClicks.series[index],
            visibleBuckets(contactClicks, range),
          ),
        ]),
      ),
    };
  } catch (error) {
    console.error("Amplitude stats unavailable:", error);
    return { status: "error" };
  }
}
