import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import { ChipRow } from "@/components/projects/chip-row";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { PillLink } from "@/components/ui/pill-link";
import { projects } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { projectContent } from "@/content/projects";
import { trackClick } from "@/lib/analytics-events";

/** A project's own page: the card's facts, then its long-form write-up. */

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};

  return { title: project.name, description: project.description };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const project = findProject((await params).slug);
  if (!project) notFound();

  const Content = projectContent[project.slug];
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

      {Content ? <Content project={project} /> : null}
    </PageSection>
  );
}
