/**
 * Click events and their properties. Components declare them as data
 * attributes via `trackClick`; the single listener in
 * `src/instrumentation-client.ts` sends them. That keeps tracked links
 * server-rendered — no client component per link. Page, referrer, geo and
 * device are attached by Amplitude; only add what it can't infer.
 */
export type ClickEvents = {
  contact_clicked: {
    type: string;
    /** Opened the link, or copied the handle with the copy button. */
    action: "open" | "copy";
  };
  cv_downloaded: { cv_version: string };
  project_clicked: {
    project: string;
    destination: "live_site" | "architecture_diagram";
    url: string;
  };
};

/** Events fired when a page is seen, via `<TrackView>`. */
export type ViewEvents = {
  architecture_diagram_viewed: { project: string };
};

export type ClickTracking = ReturnType<typeof trackClick>;

export function trackClick<E extends keyof ClickEvents>(
  event: E,
  props: ClickEvents[E],
) {
  return {
    "data-analytics-event": event,
    "data-analytics-props": JSON.stringify(props),
  };
}
