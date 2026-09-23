import * as amplitude from "@amplitude/unified";

import { analyticsEnabled, track } from "@/lib/analytics";

/**
 * Amplitude, initialised before the app hydrates. Without an API key (local
 * development, forks) nothing loads and nothing is sent.
 *
 * Amplitude supplies the context: page views (client-side navigations
 * included), attribution (UTM, referrer) and sessions via autocapture; page
 * path/title/URL and the previous page on every event via page URL enrichment;
 * geo from the IP and device/OS/browser server-side. Our events add only what
 * it can't know — which contact, which project, which CV. Components declare
 * them as `data-analytics-*` attributes (see `src/lib/analytics-events.ts`)
 * and one delegated listener sends them.
 */

/**
 * Sends the event declared on the clicked element (or its nearest ancestor)
 * by `trackClick()` from `src/lib/analytics-events.ts`.
 */
function handleTrackedClick(event: MouseEvent) {
  const target = event.target instanceof Element ? event.target : null;
  const element = target?.closest<HTMLElement>("[data-analytics-event]");
  const name = element?.dataset.analyticsEvent;
  if (!element || !name) return;

  let props: Record<string, unknown> = {};
  try {
    props = JSON.parse(element.dataset.analyticsProps ?? "{}");
  } catch {
    // Malformed props shouldn't cost us the event itself.
  }

  track(name, props);
}

if (!analyticsEnabled) {
  // The key is inlined at build time, so a build without it ships silently
  // untracked. Say so.
  console.warn("Amplitude API key missing — analytics disabled");
} else {
  try {
    // Once per page load: this file runs a single time, before hydration.
    // initAll resolves asynchronously; events tracked meanwhile are queued.
    void amplitude.initAll(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
      serverZone:
        process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE === "EU" ? "EU" : "US",
      analytics: {
        // The deployed commit, as shown in the footer: ties every event to the
        // release that produced it. Absent locally.
        appVersion: process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7),
        autocapture: {
          pageViews: { trackHistoryChanges: "pathOnly" },
          attribution: true,
          sessions: true,
          // Page path/URL/title and previous page on every event. On by
          // default but experimental, so pinned: our events rely on it.
          pageUrlEnrichment: true,
          // Explicit events cover these with meaning autocapture can't see.
          elementInteractions: false,
          fileDownloads: false,
          formInteractions: false,
          frustrationInteractions: false,
          networkTracking: false,
          webVitals: false,
        },
        // No cookies or localStorage: nothing on the visitor's device, so no
        // consent banner. Costs cross-visit identity — each visit is new.
        identityStorage: "none",
        // NEXT_PUBLIC_AMPLITUDE_DEBUG=true logs every event to the console.
        logLevel:
          process.env.NEXT_PUBLIC_AMPLITUDE_DEBUG === "true"
            ? amplitude.Types.LogLevel.Debug
            : amplitude.Types.LogLevel.Warn,
      },
      // Off until decided: recording stores buffered replays on the device,
      // which the no-consent-banner setup above rules out.
      sessionReplay: { sampleRate: 0 },
    });
    document.addEventListener("click", handleTrackedClick, { capture: true });
  } catch {
    // Analytics must never break the site.
  }
}
