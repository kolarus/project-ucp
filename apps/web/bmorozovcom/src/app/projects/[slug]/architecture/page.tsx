import {
  ProjectArchitectureView,
  projectArchitectureMetadata,
  projectArchitectureParams,
} from "@/views/project-architecture";

export const dynamicParams = false;

export function generateStaticParams() {
  return projectArchitectureParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]/architecture">) {
  return projectArchitectureMetadata((await params).slug);
}

export default async function ArchitecturePage({
  params,
}: PageProps<"/projects/[slug]/architecture">) {
  return <ProjectArchitectureView slug={(await params).slug} />;
}
