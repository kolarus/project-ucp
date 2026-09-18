import type { Metadata } from "next";

import { BannerLink } from "@/components/ui/banner-link";
import { DownloadCv } from "@/components/ui/download-cv";
import { LocationBadge } from "@/components/ui/location-badge";
import { PageColumns } from "@/components/ui/page-columns";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Prose } from "@/components/ui/prose";
import { location } from "@/config/site";

const title = "About me";
const description =
  "Software engineer and independent contractor with 9+ years building frontend and mobile products.";

export const metadata: Metadata = { title, description };

export default function AboutPage() {
  return (
    <PageSection>
      <PageHeader title={title} />
      <LocationBadge location={location} />
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
            I’m Bohdan — a software engineer and independent contractor with
            9+ years of experience building software products across different
            domains and levels of complexity. My strongest expertise is in frontend and
            mobile engineering, particularly React, TypeScript, Next.js, and
            React Native, but I’m not limited to those areas and I’m open to
            discussing projects across different stacks, including full-stack
            work. I enjoy solving engineering problems, learning new
            technologies when a project calls for them, and working on
            everything from product features to architecture, design systems,
            accessibility, and performance. I’m currently open to both contract
            and permanent opportunities.
          </p>
        </Prose>
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
