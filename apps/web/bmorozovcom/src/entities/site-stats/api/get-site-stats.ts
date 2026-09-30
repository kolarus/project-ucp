import "server-only";

import {
  amplitudeAuth,
  type SegmentationData,
  segmentation,
} from "@/shared/api/server";

import { RANGES, type RangeConfig, type RangeKey } from "../model/ranges";

/**
 * The site's own numbers for the stats page: page views, CV downloads and
 * contact clicks per channel, read from Amplitude. Without both Amplitude keys
 * the stats report `unconfigured` rather than failing.
 */

/** Counts per bucket — a day, or an hour for the 24-hour range. */
type Series = { buckets: string[]; values: number[]; total: number };

type SiteStats =
  | { status: "unconfigured" }
  | { status: "error" }
  | {
      status: "ok";
      pageViews: Series;
      cvDownloads: Series;
      /** Contact clicks keyed by `type` (email, linkedin, …). */
      contactClicks: Record<string, Series>;
    };

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
  const auth = amplitudeAuth();
  if (!auth) return { status: "unconfigured" };

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
