"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";
import type { ViewEvents } from "@/lib/analytics-events";

/**
 * Sends a view event once, when the page it's rendered on is seen. Where the
 * visitor came from (previous page, referrer, UTM) is attached by Amplitude.
 */
export function TrackView<E extends keyof ViewEvents>({
  event,
  props,
}: {
  event: E;
  props: ViewEvents[E];
}) {
  // Props arrive fresh from the server each render; compare by value.
  const serialized = JSON.stringify(props);

  useEffect(() => {
    track(event, JSON.parse(serialized));
  }, [event, serialized]);

  return null;
}
