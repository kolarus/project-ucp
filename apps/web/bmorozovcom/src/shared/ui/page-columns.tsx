import type { ReactNode } from "react";

/**
 * Content column with a sidebar that sits on the right from `lg` up and drops
 * below the content on narrower screens. The content column keeps the reading
 * measure; the sidebar sits on the container's right rail.
 */
export function PageColumns({
  children,
  aside,
}: {
  children: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="grid w-full items-start justify-between gap-10 lg:grid-cols-[minmax(0,48rem)_20rem] lg:gap-16">
      <div className="flex flex-col gap-8">{children}</div>
      <aside className="flex flex-col gap-4">{aside}</aside>
    </div>
  );
}
