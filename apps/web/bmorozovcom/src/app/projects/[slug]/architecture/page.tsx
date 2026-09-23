import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { TrackView } from "@/components/analytics/track-view";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { TextLink } from "@/components/ui/text-link";
import { projects } from "@/config/projects";

/**
 * A project's architecture diagram as a real page rather than a bare SVG, so a
 * visit is tracked however it arrives — from the card, a shared link, or a
 * bookmark.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return projects
    .filter((project) => project.diagram)
    .map((project) => ({ slug: project.slug }));
}

function findProject(slug: string) {
  const project = projects.find((candidate) => candidate.slug === slug);
  return project?.diagram ? { ...project, diagram: project.diagram } : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/architecture">): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};

  return {
    title: `${project.name} architecture`,
    description: `How ${project.name.toLowerCase()} is built, shipped and served.`,
  };
}

export default async function ArchitecturePage({
  params,
}: PageProps<"/projects/[slug]/architecture">) {
  const project = findProject((await params).slug);
  if (!project) notFound();

  return (
    <PageSection>
      <TrackView
        event="architecture_diagram_viewed"
        props={{ project: project.name }}
      />
      <PageHeader
        title={`${project.name} architecture`}
        description="From a push to main to the page you're reading."
      />
      {/* The diagram has its own white ground; scroll rather than shrink it
          past legibility on narrow screens. */}
      <figure className="overflow-x-auto rounded-2xl border border-border bg-white">
        <Image
          src={project.diagram.src}
          alt={`Architecture of ${project.name.toLowerCase()}: monorepo, GitHub Actions, Amazon ECR, an EC2 host running Caddy and the app container, and Cloudflare in front.`}
          width={project.diagram.width}
          height={project.diagram.height}
          unoptimized
          priority
          className="h-auto w-full min-w-3xl"
        />
      </figure>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <TextLink href="/projects">Back to projects</TextLink>
        <TextLink href={project.diagram.src as `/${string}.${string}`}>
          Open full size
        </TextLink>
      </div>
    </PageSection>
  );
}
