import type { Route } from "next";
import Link from "next/link";

/** Large linked card used as a page-level call to action. */
export function BannerLink({
  href,
  title,
  description,
}: {
  href: Route;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-32 flex-col justify-between gap-8 rounded-2xl border border-border p-6 transition-colors hover:border-accent hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="flex flex-col gap-2">
        <span className="text-xl font-semibold tracking-tight">{title}</span>
        <span className="text-sm text-muted">{description}</span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 text-muted transition-transform group-hover:translate-x-1"
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </Link>
  );
}
