import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { ChipRow } from "@/components/projects/chip-row";
import { PillLink } from "@/components/ui/pill-link";
import type { Project } from "@/config/projects";
import { trackClick } from "@/lib/analytics-events";

/**
 * One project as a full-width row: screenshot on the left from `sm` up, with
 * what it is, what it's for, and what it's built with beside it. The whole card
 * opens the project's page; the live site and diagram have their own buttons.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  /** Set on the first card so its image isn't lazy-loaded above the fold. */
  priority?: boolean;
}) {
  const projectPage = `/projects/${project.slug}` as Route;
  const diagramPage = `/projects/${project.slug}/architecture` as Route;
  const statsPage = `/projects/${project.slug}/stats` as Route;

  return (
    <li className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-300 hover:border-accent focus-within:border-accent sm:min-h-60 sm:flex-row">
      {/* Fill that sweeps in from the left on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 bg-foreground/[0.05] transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
      />
      <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden border-b border-border bg-foreground/[0.03] p-3 sm:aspect-auto sm:w-80 sm:border-r sm:border-b-0 lg:w-[30rem]">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 30rem, (min-width: 640px) 20rem, 100vw"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 lg:p-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {/* Stretched link: the anchor covers the card, so the whole row is
                clickable while the accessible name stays the project name. */}
            <Link
              href={projectPage}
              {...trackClick("project_clicked", {
                project: project.name,
                destination: "project_page",
                url: projectPage,
              })}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-accent"
            >
              {project.name}
            </Link>
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
        <ChipRow label="Stack" items={project.tech} />
        {project.infra ? (
          <ChipRow label="Infrastructure" items={project.infra} />
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">Updated {project.updated}</p>
          {/* `relative z-10` lifts the buttons above the stretched link. */}
          <div className="flex flex-wrap gap-2">
            <PillLink
              href={project.href}
              tracking={trackClick("project_clicked", {
                project: project.name,
                destination: "live_site",
                url: project.href,
              })}
              className="relative z-10"
            >
              Live site
            </PillLink>
            {project.stats ? (
              <PillLink
                href={statsPage}
                tracking={trackClick("project_clicked", {
                  project: project.name,
                  destination: "stats",
                  url: statsPage,
                })}
                className="relative z-10"
              >
                Live stats
              </PillLink>
            ) : null}
            {project.diagram ? (
              <PillLink
                href={diagramPage}
                tracking={trackClick("project_clicked", {
                  project: project.name,
                  destination: "architecture_diagram",
                  url: diagramPage,
                })}
                className="relative z-10"
              >
                Architecture diagram
              </PillLink>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
