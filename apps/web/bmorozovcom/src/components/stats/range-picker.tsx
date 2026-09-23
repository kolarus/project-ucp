import type { Route } from "next";
import Link from "next/link";

import { RANGES, type RangeKey } from "@/lib/amplitude-api";
import { cn } from "@/lib/cn";

/**
 * Date-range presets as plain links: the page renders on the server for the
 * chosen range, so switching needs no client state.
 */
export function RangePicker({
  basePath,
  current,
}: {
  basePath: string;
  current: RangeKey;
}) {
  return (
    <nav aria-label="Date range" className="flex flex-wrap gap-2">
      {(Object.keys(RANGES) as RangeKey[]).map((range) => {
        const isCurrent = range === current;
        return (
          <Link
            key={range}
            href={`${basePath}?range=${range}` as Route}
            aria-current={isCurrent ? "page" : undefined}
            scroll={false}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isCurrent
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-accent",
            )}
          >
            {RANGES[range].label}
          </Link>
        );
      })}
    </nav>
  );
}
