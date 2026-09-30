// Guards: a change in how we read Amplitude's response silently putting wrong
// numbers on the stats page.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSiteStats } from "./get-site-stats";

// The real module throws outside a React Server Components build.
vi.mock("server-only", () => ({}));

/** Amplitude's hourly buckets for yesterday and today, as it returns them. */
function hourlyBuckets(firstDay: string) {
  return Array.from({ length: 48 }, (_, hour) => {
    const start =
      new Date(`${firstDay}T00:00:00Z`).getTime() + hour * 3_600_000;
    return new Date(start).toISOString().slice(0, 19);
  });
}

function stubAmplitude(xValues: string[]) {
  const byEvent: Record<string, object> = {
    "[Amplitude] Page Viewed": {
      series: [xValues.map((_, i) => i + 1)],
      seriesLabels: [0],
      xValues,
    },
    cv_downloaded: { series: [[]], seriesLabels: [0], xValues },
    contact_clicked: {
      series: [xValues.map(() => 1), xValues.map(() => 2)],
      // Amplitude has returned grouped labels both ways.
      seriesLabels: [[0, "github"], "email"],
      xValues,
    },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const event = JSON.parse(new URL(url).searchParams.get("e")!) as {
        event_type: string;
      };
      return Promise.resolve(
        Response.json({ data: byEvent[event.event_type] }),
      );
    }),
  );
}

describe("getSiteStats", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_AMPLITUDE_API_KEY", "test-key");
    vi.stubEnv("AMPLITUDE_SECRET_KEY", "test-secret");
    vi.useFakeTimers({ toFake: ["Date"] });
    stubAmplitude(hourlyBuckets("2026-09-29"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("keeps the 24 hourly buckets ending with the current hour", async () => {
    vi.setSystemTime(new Date("2026-09-30T14:00:00Z"));

    const stats = await getSiteStats("24h");

    if (stats.status !== "ok") throw new Error(stats.status);
    expect(stats.pageViews.buckets).toHaveLength(24);
    expect(stats.pageViews.buckets[0]).toBe("2026-09-29T15:00:00");
    expect(stats.pageViews.buckets.at(-1)).toBe("2026-09-30T14:00:00");
    // Bucket i holds i + 1 views, so 15:00 yesterday (index 15) holds 16 and
    // 14:00 today (index 38) holds 39.
    expect(stats.pageViews.values[0]).toBe(16);
    expect(stats.pageViews.total).toBe(660); // 16 + 17 + … + 39
    // A series Amplitude returned empty counts as zeros, not as missing.
    expect(stats.cvDownloads.values).toEqual(Array(24).fill(0));
  });

  it("moves the window at the hour boundary, not before", async () => {
    vi.setSystemTime(new Date("2026-09-30T13:59:59.999Z"));

    const stats = await getSiteStats("24h");

    if (stats.status !== "ok") throw new Error(stats.status);
    expect(stats.pageViews.buckets[0]).toBe("2026-09-29T14:00:00");
    expect(stats.pageViews.buckets.at(-1)).toBe("2026-09-30T13:00:00");
  });

  it("reads grouped labels both as [index, value] pairs and plain strings", async () => {
    vi.setSystemTime(new Date("2026-09-30T14:00:00Z"));

    const stats = await getSiteStats("24h");

    if (stats.status !== "ok") throw new Error(stats.status);
    expect(Object.keys(stats.contactClicks)).toEqual(["github", "email"]);
    expect(stats.contactClicks.github?.total).toBe(24);
    expect(stats.contactClicks.email?.total).toBe(48);
  });
});
