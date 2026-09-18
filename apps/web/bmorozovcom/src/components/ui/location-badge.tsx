import type { Location } from "@/config/site";

/**
 * Says two things at a glance: where I actually am, and that distance isn't a
 * constraint. The pulsing dot marks the availability half, not the address.
 */
export function LocationBadge({ location }: { location: Location }) {
  return (
    <p className="inline-flex w-fit flex-wrap items-center gap-x-3 gap-y-2 self-start rounded-full border border-border px-4 py-2 text-sm">
      <span className="inline-flex items-center gap-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-muted"
        >
          <path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="text-muted">
          Based in <span className="font-medium text-foreground">{location.base}</span>
        </span>
      </span>
      <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
      <span className="inline-flex items-center gap-2">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:hidden" />
          <span className="relative inline-flex size-2.5 rounded-full bg-live" />
        </span>
        <span className="font-medium">{location.availability}</span>
      </span>
    </p>
  );
}
