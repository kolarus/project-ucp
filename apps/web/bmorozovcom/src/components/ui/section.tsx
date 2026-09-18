import type { ReactNode } from "react";

/** Titled block within a page, one level below `PageHeader`. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
