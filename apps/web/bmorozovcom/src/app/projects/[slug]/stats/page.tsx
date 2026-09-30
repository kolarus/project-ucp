import {
  ProjectStatsView,
  projectStatsMetadata,
  projectStatsParams,
} from "@/views/project-stats";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectStatsParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/stats">) {
  return projectStatsMetadata((await params).slug);
}

export default async function StatsPage({
  params,
  searchParams,
}: PageProps<"/projects/[slug]/stats">) {
  return (
    <ProjectStatsView
      slug={(await params).slug}
      range={(await searchParams).range}
    />
  );
}
