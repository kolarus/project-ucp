import type { Metadata } from "next";

import { ProjectList } from "@/components/projects/project-list";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Prose } from "@/components/ui/prose";
import { projects } from "@/config/projects";

const title = "Projects";
const description = "Personal pet projects and experiments.";

export const metadata: Metadata = { title, description };

export default function ProjectsPage() {
  return (
    <PageSection>
      <PageHeader title={title} />
      <Prose>
        <p>
          Things I build and experiment with outside client work. Each one is
          small on purpose — something to try an idea on, or to have a place to
          put something I need.
        </p>
      </Prose>
      <ProjectList projects={projects} />
    </PageSection>
  );
}
