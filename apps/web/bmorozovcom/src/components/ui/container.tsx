import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The rails every band shares — header, page body, footer — so the logo, the
 * page heading and the footer all line up on the same left edge.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[90rem] px-6 md:px-10 lg:px-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
