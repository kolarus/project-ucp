import { cn } from "@/lib/cn";

/** Full-width shell with responsive gutters; content spans the viewport. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full px-6 md:px-10 lg:px-16", className)}>
      {children}
    </div>
  );
}
