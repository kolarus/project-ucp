export type Stat = {
  value: string;
  label: string;
  /** Marks availability rather than a number — renders the live dot. */
  live?: boolean;
  /** Half-width section: two compact stats occupy one regular one. */
  compact?: boolean;
};

/**
 * One row of headline facts, read after the intro. Keep values short: they're
 * set at heading size. Sections are sized in sixths — compact takes one, a
 * regular stat takes two — so they must add up to six.
 */
export const stats: readonly Stat[] = [
  { value: "9+", label: "Years", compact: true },
  { value: "12", label: "Projects", compact: true },
  { value: "Warsaw, PL", label: "Based in" },
  { value: "Open to work", label: "Contract or full-time", live: true },
];
