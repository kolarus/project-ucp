import "server-only";

/**
 * Read side of Amplitude: the Dashboard REST API's event segmentation, queried
 * from the server with the project's secret key — which must never reach the
 * browser, hence `server-only`.
 *
 * Needs `NEXT_PUBLIC_AMPLITUDE_API_KEY` (the same key the browser uses, inlined
 * at build) and `AMPLITUDE_SECRET_KEY` (runtime only).
 */

type EventQuery = {
  event_type: string;
  group_by?: { type: "event"; value: string }[];
};

export type SegmentationData = {
  series: number[][];
  /** Grouped values: plain strings, or `[index, value]` pairs. */
  seriesLabels: unknown[];
  /** Bucket starts in the project's timezone (UTC here). */
  xValues: string[];
};

type SegmentationQuery = {
  /** Bucket size: hourly queries refresh in Amplitude every ~5 minutes. */
  granularity: "hour" | "day";
  /** Calendar days queried, counting today. */
  queryDays: number;
  /** Our own cache, in seconds. */
  revalidate: number;
};

/** Basic auth for the Dashboard API; null unless both keys are set. */
export function amplitudeAuth() {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  const secretKey = process.env.AMPLITUDE_SECRET_KEY;
  if (!apiKey || !secretKey) return null;
  return Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
}

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

export async function segmentation(
  event: EventQuery,
  query: SegmentationQuery,
  auth: string,
): Promise<SegmentationData> {
  const { start, end } = dateSpan(query.queryDays);
  const params = new URLSearchParams({
    e: JSON.stringify(event),
    start,
    end,
    // Amplitude's interval codes: -3600000 hourly, 1 daily.
    i: query.granularity === "hour" ? "-3600000" : "1",
    m: "totals",
  });

  const response = await fetch(
    `${apiBaseUrl()}/api/2/events/segmentation?${params}`,
    {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: query.revalidate },
    },
  );
  if (!response.ok) {
    throw new Error(`Amplitude segmentation ${response.status}`);
  }
  return ((await response.json()) as { data: SegmentationData }).data;
}
