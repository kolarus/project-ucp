import type { ReactNode } from "react";

/** Titled block within a page, one level below `PageHeader`. */
export function Section({
  title,
  id,
  children,
}: {
  title: string;
  /** Anchor to link straight to this section. */
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
