import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

/** Site shell footer. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="py-6 text-sm text-muted">
        &copy; {new Date().getFullYear()} {siteConfig.name}
      </Container>
    </footer>
  );
}
