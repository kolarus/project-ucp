import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import type { ClickTracking } from "@/lib/analytics-events";
import { cn } from "@/lib/cn";

/**
 * Small outlined link-button. Internal routes navigate client-side; external
 * URLs open in a new tab with an outward arrow.
 */
export function PillLink({
  href,
  children,
  tracking,
  className,
}: {
  href: Route | `https://${string}`;
  children: ReactNode;
  /** Analytics attributes from `trackClick`. */
  tracking?: ClickTracking;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    className,
  );

  if (href.startsWith("https://")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        {...tracking}
        className={classes}
      >
        {children}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M14 4h6v6" />
          <path d="M20 4 10 14" />
          <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
        </svg>
      </a>
    );
  }

  return (
    <Link href={href as Route} {...tracking} className={classes}>
      {children}
    </Link>
  );
}
