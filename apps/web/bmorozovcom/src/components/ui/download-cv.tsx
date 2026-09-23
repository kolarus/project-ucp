import { cv } from "@/config/site";
import { trackClick } from "@/lib/analytics-events";
import { cn } from "@/lib/cn";

/** CV download button with the file's date, wired to `cv` in the site config. */
export function DownloadCv({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <a
        href={cv.href}
        download={cv.fileName}
        {...trackClick("cv_downloaded", { cv_version: cv.updated })}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        Download CV
      </a>
      <span className="text-sm text-muted">Updated {cv.updated}</span>
    </div>
  );
}
