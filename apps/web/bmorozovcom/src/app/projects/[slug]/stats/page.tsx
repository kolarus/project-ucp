import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";

import { ColumnChart } from "@/components/stats/column-chart";
import { RangePicker } from "@/components/stats/range-picker";
import { StatTile } from "@/components/stats/stat-tile";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { contactChannels } from "@/config/contact";
import { projects } from "@/config/projects";
import { getSiteStats, parseRange, RANGES } from "@/lib/amplitude-api";

/**
 * A project's own numbers, pulled from its Amplitude events on the server and
 * drawn here. Rendered per request for the chosen range. Freshness is bounded
 * by Amplitude's own query cache, which the page states per range.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return projects
    .filter((project) => project.stats)
    .map((project) => ({ slug: project.slug }));
}

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug && project.stats);
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/stats">): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return {};

  return {
    title: `${project.name} stats`,
    description: `Live numbers for ${project.name.toLowerCase()}, from its own Amplitude events.`,
  };
}

export default async function StatsPage({
  params,
  searchParams,
}: PageProps<"/projects/[slug]/stats">) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const range = parseRange((await searchParams).range);
  const stats = await getSiteStats(range);
  const basePath = `/projects/${project.slug}/stats`;
  const { granularity, freshness } = RANGES[range];
  const per = granularity === "hour" ? "per hour" : "per day";

  // Every channel in the config's order, zero-filled when it had no clicks.
  // Email copies are tracked with `type: "email"`, so they count as email.
  const channels =
    stats.status === "ok"
      ? contactChannels.map((channel) => {
          const series = stats.contactClicks[channel.label.toLowerCase()];
          return {
            label: channel.label,
            buckets: series?.buckets ?? stats.pageViews.buckets,
            values: series?.values ?? stats.pageViews.buckets.map(() => 0),
            total: series?.total ?? 0,
          };
        })
      : [];
  const channelScaleMax = Math.max(0, ...channels.flatMap((c) => c.values));

  return (
    <PageSection>
      <PageHeader
        title={`${project.name} stats`}
        description="Pulled from this site's own Amplitude events and drawn here."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <RangePicker basePath={basePath} current={range} />
        <TextLink href={`/projects/${project.slug}#analytics` as Route}>
          What&apos;s tracked, and how
        </TextLink>
      </div>

      {/* Amplitude caches query results itself; say how fresh this range is. */}
      <p className="-mt-4 text-sm text-muted">
        Amplitude recalculates this range {freshness}
        {granularity === "hour"
          ? "."
          : ` — pick “${RANGES["24h"].label}” for near-live numbers.`}
      </p>

      {stats.status === "unconfigured" ? (
        <p className="max-w-3xl rounded-xl border border-dashed border-border p-6 text-sm text-muted">
          Stats aren&apos;t connected in this environment — the Amplitude secret
          key isn&apos;t set.
        </p>
      ) : stats.status === "error" ? (
        <p className="max-w-3xl rounded-xl border border-dashed border-border p-6 text-sm text-muted">
          Amplitude didn&apos;t answer just now. Try again in a minute.
        </p>
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Page views" value={stats.pageViews.total} />
            <StatTile label="CV downloads" value={stats.cvDownloads.total} />
            <StatTile
              label="Contact clicks"
              value={channels.reduce(
                (total, channel) => total + channel.total,
                0,
              )}
            />
          </dl>

          <div className="grid gap-10 lg:grid-cols-2">
            <ColumnChart
              title={`Page views ${per}`}
              buckets={stats.pageViews.buckets}
              values={stats.pageViews.values}
              granularity={granularity}
            />
            <ColumnChart
              title={`CV downloads ${per}`}
              buckets={stats.cvDownloads.buckets}
              values={stats.cvDownloads.values}
              granularity={granularity}
            />
          </div>

          <Section title="Contact clicks by channel">
            <div className="grid gap-10 sm:grid-cols-2">
              {channels.map((channel) => (
                <ColumnChart
                  key={channel.label}
                  title={`${channel.label} clicks ${per}`}
                  buckets={channel.buckets}
                  values={channel.values}
                  granularity={granularity}
                  scaleMax={channelScaleMax}
                />
              ))}
            </div>
          </Section>
        </>
      )}

      <p className="max-w-3xl text-sm leading-6 text-muted">
        These are counts of events, not people. The site stores nothing in your
        browser, so Amplitude can&apos;t tell a returning visitor from a new one
        — page views are the honest measure here, not visitors.
      </p>
    </PageSection>
  );
}
