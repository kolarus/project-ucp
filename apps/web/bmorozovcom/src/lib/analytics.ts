import * as amplitude from "@amplitude/unified";

/** Client-only. Analytics is on only when a key was baked in at build time. */
export const analyticsEnabled = Boolean(
  process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
);

export function track(event: string, props?: Record<string, unknown>) {
  if (!analyticsEnabled) return;
  try {
    amplitude.track(event, props);
  } catch {
    // Analytics must never break the site.
  }
}
