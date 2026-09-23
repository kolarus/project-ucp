import { formatCount, formatDay, formatHour } from "@/lib/format";

/** Smallest of 1, 2, 5 × 10ⁿ at or above `value`, so ticks stay round. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((n) => n * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * One series of counts per day or per hour as columns, rendered on the server.
 * Hovering a column shows its bucket and value; screen readers get the range
 * and total.
 */
export function ColumnChart({
  title,
  buckets,
  values,
  granularity = "day",
  scaleMax,
}: {
  title: string;
  /** Bucket starts, as Amplitude returns them. */
  buckets: readonly string[];
  values: readonly number[];
  granularity?: "day" | "hour";
  /** Shared top of the scale, so small multiples compare fairly. */
  scaleMax?: number;
}) {
  const max = niceMax(scaleMax ?? Math.max(0, ...values));
  const ticks = max % 2 === 0 ? [max, max / 2, 0] : [max, 0];
  const total = values.reduce((a, b) => a + b, 0);
  // Hourly buckets span two dates, so every label carries its day.
  const bucketLabel = (bucket: string) =>
    granularity === "hour"
      ? `${formatDay(bucket)}, ${formatHour(bucket)} UTC`
      : formatDay(bucket);
  const summary = `${title}, ${bucketLabel(buckets[0] ?? "")} to ${bucketLabel(buckets.at(-1) ?? "")}: ${formatCount(total)} in total.`;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">{title}</span>
        <span className="text-muted">{formatCount(total)} total</span>
      </figcaption>

      <div className="flex gap-3">
        {/* Y axis: round ticks, top to bottom. */}
        <div
          aria-hidden="true"
          className="flex h-40 flex-col justify-between text-right text-xs text-muted tabular-nums"
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="-translate-y-1/2 leading-none last:translate-y-1/2"
            >
              {formatCount(tick)}
            </span>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div role="img" aria-label={summary} className="relative h-40">
            {/* Hairline gridlines at each tick; the baseline is the last. */}
            {ticks.map((tick) => (
              <div
                key={tick}
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-border"
                style={{ bottom: `${(tick / max) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-0.5">
              {values.map((value, index) => {
                const height = (value / max) * 100;
                return (
                  <div
                    key={buckets[index]}
                    className="group relative flex h-full flex-1 items-end justify-center"
                  >
                    {value > 0 ? (
                      <div
                        className="w-full max-w-6 rounded-t bg-foreground/70 transition-colors group-hover:bg-foreground"
                        style={{ height: `${height}%` }}
                      />
                    ) : null}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none invisible absolute z-10 mb-2 flex flex-col items-center rounded-md border border-border bg-background px-2 py-1 text-xs whitespace-nowrap shadow-sm group-hover:visible"
                      style={{ bottom: `${height}%` }}
                    >
                      <span className="font-semibold">
                        {formatCount(value)}
                      </span>
                      <span className="text-muted">
                        {bucketLabel(buckets[index] ?? "")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="flex justify-between text-xs text-muted"
          >
            <span>{bucketLabel(buckets[0] ?? "")}</span>
            <span>{bucketLabel(buckets.at(-1) ?? "")}</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
