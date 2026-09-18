import Image from "next/image";

import type { Project } from "@/config/projects";

/**
 * One project as a full-width row: screenshot on the left from `sm` up, with
 * what it is, what it's for, and what it's built with beside it.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  /** Set on the first card so its image isn't lazy-loaded above the fold. */
  priority?: boolean;
}) {
  const isExternal = project.href.startsWith("http");

  return (
    <li className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-300 hover:border-accent focus-within:border-accent sm:min-h-60 sm:flex-row">
      {/* Fill that sweeps in from the left on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-foreground/[0.05] transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
      />
      <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden border-b border-border sm:aspect-auto sm:w-72 sm:border-r sm:border-b-0 lg:w-96">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 18rem, 100vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {/* Stretched link: the anchor covers the card, so the whole row is
                clickable while the accessible name stays the project name. */}
            <a
              href={project.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-accent"
            >
              {project.name}
            </a>
          </h3>
          <p className="max-w-prose text-sm leading-6 text-muted">
            {project.description}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">
            Purpose
          </span>
          <p className="max-w-prose text-sm leading-6">{project.purpose}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {project.tech.map((item) => (
            <li
              key={item}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-auto text-xs text-muted">Updated {project.updated}</p>
      </div>
    </li>
  );
}
