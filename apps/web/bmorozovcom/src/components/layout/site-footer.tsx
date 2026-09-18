import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

/**
 * Baked in at build time by the Dockerfile's `GIT_SHA` arg, so it names the
 * commit this deployment was built from. Absent in local development.
 */
const gitSha = process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7);

/** Site shell footer. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-sm text-muted">
        <span>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        {gitSha ? (
          <span className="font-mono text-xs">Deployment {gitSha}</span>
        ) : null}
      </Container>
    </footer>
  );
}
