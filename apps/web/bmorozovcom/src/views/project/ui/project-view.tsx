import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import { ChipRow, projects, ProjectWriteUp } from "@/entities/project";
import { trackClick } from "@/shared/analytics";
import { siteConfig } from "@/shared/config";
import { PageHeader, PageSection, PillLink } from "@/shared/ui";

/** A project's own page: the card's facts, then its long-form write-up. */

export function projectParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function projectMetadata(slug: string): Metadata {
  const project = findProject(slug);
  if (!project) return {};

  return { title: project.name, description: project.description };
}

export function ProjectView({ slug }: { slug: string }) {
  const project = findProject(slug);
  if (!project) notFound();

  const diagramPage = `/projects/${project.slug}/architecture` as Route;
  const statsPage = `/projects/${project.slug}/stats` as Route;
  const sourceUrl = project.sourcePath
    ? (`${siteConfig.repoUrl}/tree/main/${project.sourcePath}` as const)
    : null;

  return (
    <PageSection>
      <PageHeader title={project.name} description={project.description} />

      <div className="flex flex-wrap gap-2">
        <PillLink
          href={project.href}
          tracking={trackClick("project_clicked", {
            project: project.name,
            destination: "live_site",
            url: project.href,
          })}
        >
          Live site
        </PillLink>
        {sourceUrl ? (
          <PillLink
            href={sourceUrl}
            tracking={trackClick("project_clicked", {
              project: project.name,
              destination: "source",
              url: sourceUrl,
            })}
          >
            Source on GitHub
          </PillLink>
        ) : null}
        {project.stats ? (
          <PillLink
            href={statsPage}
            tracking={trackClick("project_clicked", {
              project: project.name,
              destination: "stats",
              url: statsPage,
            })}
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
          >
            Architecture diagram
          </PillLink>
        ) : null}
      </div>

      <div className="flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">
            Purpose
          </span>
          <p className="leading-7">{project.purpose}</p>
        </div>
        <ChipRow label="Stack" items={project.tech} />
        {project.infra ? (
          <ChipRow label="Infrastructure" items={project.infra} />
        ) : null}
        <p className="text-xs text-muted">Updated {project.updated}</p>
      </div>

      <ProjectWriteUp project={project} />
    </PageSection>
  );
}
