"use client";

import { useEffect, useState } from "react";

import type { ClickTracking } from "@/lib/analytics-events";
import { cn } from "@/lib/cn";

/**
 * Copies a value to the clipboard — for details people need to paste somewhere
 * rather than open, like an address on a machine with no mail client.
 */
export function CopyButton({
  value,
  label,
  tracking,
  className,
}: {
  value: string;
  label: string;
  /** Analytics attributes from `trackClick`, if the copy should be counted. */
  tracking?: ClickTracking;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard unavailable (older browser, insecure context): the value is
      // on screen and selectable, so there's nothing to fall back to.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      {...tracking}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {copied ? (
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
          <path d="m20 6-11 11-5-5" />
        </svg>
      ) : (
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
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
