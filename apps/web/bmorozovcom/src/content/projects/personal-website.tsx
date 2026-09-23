import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { Code } from "@/components/ui/code";
import { PillLink } from "@/components/ui/pill-link";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { Table } from "@/components/ui/table";
import { TextLink } from "@/components/ui/text-link";
import type { Project } from "@/config/projects";
import { trackClick } from "@/lib/analytics-events";

/** The write-up for this site's own project page. */
export function PersonalWebsite({ project }: { project: Project }) {
  const diagramPage = `/projects/${project.slug}/architecture` as Route;
  const statsPage = `/projects/${project.slug}/stats` as Route;

  return (
    <>
      <Section title="What makes it interesting">
        <ul className="flex max-w-3xl list-disc flex-col gap-2 pl-5 leading-7">
          <li>
            It reports on itself: a{" "}
            <TextLink href="#live-stats">live stats page</TextLink> reads the
            site&apos;s own analytics back from Amplitude and charts them.
          </li>
          <li>
            Server-rendered by default: every page but the stats page is
            prerendered at build time. The only code that runs in the browser is
            the nav&apos;s active state, the copy button, and analytics.
          </li>
          <li>
            A push to <Code>main</Code> is the whole release process — no SSH,
            no long-lived AWS keys.
          </li>
          <li>
            The footer shows the commit that&apos;s running. The same SHA goes
            to Amplitude as <Code>app_version</Code>, so behaviour can be
            compared release by release.
          </li>
          <li>
            Content is typed config in <Code>src/config</Code>, and typed routes
            turn a broken internal link into a build error.
          </li>
        </ul>
      </Section>

      {project.diagram ? (
        <Section title="Architecture">
          <Link
            href={diagramPage}
            {...trackClick("project_clicked", {
              project: project.name,
              destination: "architecture_diagram",
              url: diagramPage,
            })}
            className="block overflow-hidden rounded-2xl border border-border bg-white transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Image
              src={project.diagram.src}
              alt="Architecture diagram — open the full-size view."
              width={project.diagram.width}
              height={project.diagram.height}
              unoptimized
              className="h-auto w-full"
            />
          </Link>
        </Section>
      ) : null}

      <Section title="Delivery pipeline">
        <ol className="flex max-w-3xl list-decimal flex-col gap-2 pl-5 leading-7">
          <li>
            A push to <Code>main</Code> triggers GitHub Actions, which assumes
            an AWS role through OIDC.
          </li>
          <li>
            <Code>docker build</Code> runs from the repo root with the
            app&apos;s own Dockerfile, baking in the commit SHA and the
            Amplitude key. Next.js standalone output keeps only the server and
            the modules it traces.
          </li>
          <li>
            The image is pushed to Amazon ECR as <Code>:sha</Code> and{" "}
            <Code>:latest</Code>; a lifecycle policy keeps the last ten.
          </li>
          <li>
            SSM Run Command tells the EC2 host to pull the image and restart the
            container, handing it the Amplitude secret key the stats page reads
            with — at start, never baked into the image.
          </li>
          <li>
            Caddy on ports 80 and 443 proxies to the container on{" "}
            <Code>127.0.0.1:3000</Code>. Cloudflare sits in front for DNS and
            proxying.
          </li>
        </ol>
      </Section>

      <Section title="Infrastructure">
        <Prose>
          <p>
            Everything on AWS is Terraform, in <Code>apps/infra</Code>:
          </p>
        </Prose>
        <ul className="flex max-w-3xl list-disc flex-col gap-2 pl-5 leading-7">
          <li>
            EC2 <Code>t3.micro</Code> on Ubuntu 24.04 with an Elastic IP. The
            security group opens only 80 and 443 — access is through SSM.
          </li>
          <li>
            An instance role that can read from ECR and be managed by SSM.
          </li>
          <li>The ECR repository and its lifecycle policy.</li>
          <li>
            A GitHub OIDC provider and a deploy role scoped to this repository.
          </li>
          <li>cloud-init that installs Docker, the AWS CLI and Caddy.</li>
        </ul>
      </Section>

      <Section title="Analytics" id="analytics">
        <Prose>
          <p>
            Amplitude, with the context left to Amplitude: autocapture records
            page views, sessions and campaign attribution; every event is
            enriched with the current and previous page; location and device are
            resolved on Amplitude&apos;s side. The site only sends what
            Amplitude can&apos;t infer:
          </p>
        </Prose>
        <div className="max-w-3xl">
          <Table
            columns={["Event", "Fires when", "Properties"]}
            rows={[
              [
                <Code key="e">contact_clicked</Code>,
                "A contact card is opened, or its handle copied",
                "type, action",
              ],
              [
                <Code key="e">cv_downloaded</Code>,
                "The CV is downloaded",
                "cv_version",
              ],
              [
                <Code key="e">project_clicked</Code>,
                "A project link is followed — page, live site, stats, diagram or source",
                "project, destination, url",
              ],
              [
                <Code key="e">architecture_diagram_viewed</Code>,
                "The architecture diagram page is seen, however it was reached",
                "project",
              ],
            ]}
          />
        </div>
        <Prose>
          <p>
            No cookies or local storage, and Session Replay is off, so there is
            no consent banner. Local and test builds report to a separate
            Amplitude project from production.
          </p>
        </Prose>
      </Section>

      {project.stats ? (
        <Section title="Live stats" id="live-stats">
          <Prose>
            <p>
              The same events come back out on a public stats page: page views,
              CV downloads and contact clicks per channel. The server queries
              Amplitude&apos;s Dashboard REST API — so the secret key never
              reaches the browser — and draws the charts as plain
              server-rendered HTML and CSS, with no charting library.
            </p>
            <p>
              Freshness is Amplitude&apos;s call: it caches query results
              itself, for about five minutes on hourly queries and hours on
              daily ones. So the default view is the last 24 hours in hourly
              buckets, and every range says how fresh it is.
            </p>
          </Prose>
          <div>
            <PillLink
              href={statsPage}
              tracking={trackClick("project_clicked", {
                project: project.name,
                destination: "stats",
                url: statsPage,
              })}
            >
              Open live stats
            </PillLink>
          </div>
        </Section>
      ) : null}
    </>
  );
}
