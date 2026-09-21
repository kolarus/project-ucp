import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const linkClassName =
  "font-medium underline underline-offset-4 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Inline link inside body copy; nav links style themselves in `SiteNav`.
 * Internal routes are type-checked and navigate client-side; absolute URLs
 * open in a new tab.
 */
export function TextLink({
  href,
  children,
}: {
  href: Route | `https://${string}`;
  children: ReactNode;
}) {
  if (href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={linkClassName}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={linkClassName}>
      {children}
    </Link>
  );
}
