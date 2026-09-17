"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import type { NavItem } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The only client component in the shell: it needs the active segment to mark
 * the current link. Links themselves are prefetched and navigate client-side.
 */
export function SiteNav({
  items,
  className,
}: {
  items: readonly NavItem[];
  className?: string;
}) {
  const segment = useSelectedLayoutSegment();

  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1 sm:gap-2">
        {items.map((item) => {
          const isActive = item.segment === segment;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm sm:text-base transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  isActive ? "font-medium text-foreground" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
