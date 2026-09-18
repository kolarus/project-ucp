import type { ReactNode } from "react";

/** Body copy at a readable measure. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-4 text-base leading-7">
      {children}
    </div>
  );
}
