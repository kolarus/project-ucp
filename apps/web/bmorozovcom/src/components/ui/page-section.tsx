import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

/** Standard page body: fills the viewport below the header. */
export function PageSection({ children }: { children: ReactNode }) {
  return (
    <Container className="flex flex-1 flex-col gap-10 py-14 lg:py-20">
      {children}
    </Container>
  );
}
