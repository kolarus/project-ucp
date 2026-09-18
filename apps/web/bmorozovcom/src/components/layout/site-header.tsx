import Link from "next/link";

import { SiteNav } from "@/components/layout/site-nav";
import { Container } from "@/components/ui/container";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Sticky site shell header: text logo left, main nav centred. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex flex-col items-center gap-1 py-3 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:py-0">
        {/* Not a page of its own: the logo is a link to "About me" (the index route). */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight md:justify-self-start lg:text-xl"
        >
          {siteConfig.name}
        </Link>
        <SiteNav items={mainNav} className="md:justify-self-center" />
        <div className="hidden md:block" aria-hidden="true" />
      </Container>
    </header>
  );
}
