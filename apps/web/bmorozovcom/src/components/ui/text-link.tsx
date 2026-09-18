import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/** Inline link inside body copy; nav links style themselves in `SiteNav`. */
export function TextLink({
  href,
  children,
}: {
  href: Route;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium underline underline-offset-4 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </Link>
  );
}
