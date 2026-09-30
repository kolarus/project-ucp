const exact = new Intl.NumberFormat("en");
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1,284 stays exact; 12,900 becomes 12.9K. */
export function formatCount(value: number) {
  return value < 10_000 ? exact.format(value) : compact.format(value);
}

const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Amplitude's `2026-09-23` → `Sep 23`. */
export function formatDay(isoDate: string) {
  return shortDate.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

const hourOfDay = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

/** Amplitude's hourly `2026-09-23T15:00:00` (UTC) → `15:00`. */
export function formatHour(isoDateTime: string) {
  return hourOfDay.format(new Date(`${isoDateTime.slice(0, 19)}Z`));
}
