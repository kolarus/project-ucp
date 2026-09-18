import type { Stat } from "@/config/about";

/**
 * The headline facts as one divided card. Compact stats take half the width of
 * a regular one, so a pair of figures reads as a single section of the row.
 */
export function StatGrid({ stats }: { stats: readonly Stat[] }) {
  return (
    <dl className="grid divide-y divide-border overflow-hidden rounded-xl border border-border sm:grid-cols-6 sm:divide-x sm:divide-y-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex flex-col gap-0.5 px-5 py-4 ${
            stat.compact ? "sm:col-span-1" : "sm:col-span-2"
          }`}
        >
          <dd className="flex items-baseline gap-2">
            {stat.live ? (
              <span className="relative flex size-2.5 shrink-0 self-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex size-2.5 rounded-full bg-live" />
              </span>
            ) : null}
            <span
              className={`font-semibold tracking-tight tabular-nums ${
                stat.compact ? "text-lg" : "text-xl"
              }`}
            >
              {stat.value}
            </span>
          </dd>
          <dt className="text-xs tracking-wide text-muted uppercase">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
