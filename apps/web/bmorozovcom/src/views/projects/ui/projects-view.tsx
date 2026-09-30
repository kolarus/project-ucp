import type { Metadata } from "next";

import { ProjectList, projects } from "@/entities/project";
import { siteConfig } from "@/shared/config";
import { PageHeader, PageSection, Prose, TextLink } from "@/shared/ui";

const title = "Projects";
const description = "Personal pet projects and experiments.";

export const projectsMetadata: Metadata = { title, description };

export function ProjectsView() {
  return (
    <PageSection>
      <PageHeader title={title} />
      <Prose>
        <p>
          This site doubles as a catalogue of my personal projects — a technical
          playground where I learn and practice new tools and ideas.
        </p>
        <p>
          Nothing here is built for commercial users. Each project is small on
          purpose: somewhere to try an idea, or to keep something I need — and
          to show that I can build and own a working system end to end, with
          production-grade practices and technologies.
        </p>
        <p>
          So apologies if it all looks a little plain. Most of the beauty is in
          the code: everything lives together in one open-source monorepo on{" "}
          <TextLink href={siteConfig.repoUrl}>GitHub</TextLink>.
        </p>
      </Prose>
      <ProjectList projects={projects} />
    </PageSection>
  );
}
