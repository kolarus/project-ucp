import type { Metadata } from "next";

import { StatGrid, stats } from "@/entities/profile";
import { DownloadCv } from "@/features/download-cv";
import {
  BannerLink,
  PageColumns,
  PageHeader,
  PageSection,
  Prose,
} from "@/shared/ui";

const title = "About me";
const description =
  "Software engineer and independent contractor with 9+ years building frontend and mobile products.";

export const aboutMetadata: Metadata = { title, description };

export function AboutView() {
  return (
    <PageSection>
      <PageHeader title={title} />
      <PageColumns
        aside={
          <>
            <BannerLink
              href="/projects"
              title="Projects"
              description="Things I build and experiment with outside client work."
            />
            <BannerLink
              href="/contact"
              title="Contact me"
              description="Open to contract and permanent work — say hello."
            />
          </>
        }
      >
        <Prose>
          <p>
            I’m Bohdan — a software engineer and independent contractor who has
            built products across many domains and levels of complexity. My
            strongest expertise is in frontend and mobile engineering,
            particularly React, TypeScript, Next.js, and React Native, but I’m
            not limited to those areas and I’m open to projects across different
            stacks, including full-stack work. I enjoy solving engineering
            problems, learning new technologies when a project calls for them,
            and working on everything from product features to architecture,
            design systems, accessibility, and performance.
          </p>
        </Prose>
        <StatGrid stats={stats} />
        <DownloadCv />
        <Prose>
          <p>
            Outside of work, I enjoy building and experimenting with software of
            my own. I’m also into cars, camping and road trips, and can spend an
            unreasonable amount of time researching vehicles, gear, and travel
            setups.
          </p>
        </Prose>
      </PageColumns>
    </PageSection>
  );
}
