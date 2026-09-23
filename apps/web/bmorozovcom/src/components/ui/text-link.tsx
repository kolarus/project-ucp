import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const linkClassName =
  "font-medium underline underline-offset-4 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Inline link inside body copy; nav links style themselves in `SiteNav`.
 * Internal routes are type-checked and navigate client-side; `#anchors` jump
 * within the page; absolute URLs and static files open in a new tab.
 */
export function TextLink({
  href,
  children,
}: {
  href: Route | `#${string}` | `https://${string}` | `/${string}.${string}`;
  children: ReactNode;
}) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={linkClassName}>
        {children}
      </a>
    );
  }

  // A path with a file extension is a static asset, not a route.
  if (/\.[a-z0-9]+$/i.test(href)) {
    return (
      <a href={href} target="_blank" className={linkClassName}>
        {children}
      </a>
    );
  }

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
