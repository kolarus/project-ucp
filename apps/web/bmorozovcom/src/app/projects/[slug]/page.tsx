import { ProjectView, projectMetadata, projectParams } from "@/views/project";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">) {
  return projectMetadata((await params).slug);
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  return <ProjectView slug={(await params).slug} />;
}
