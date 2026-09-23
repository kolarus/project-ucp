import type { ReactNode } from "react";

/** Inline code: file paths, event names, commands. */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  );
}
