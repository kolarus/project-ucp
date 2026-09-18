import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/config/projects";

/** Project rows, newest work first. */
export function ProjectList({ projects }: { projects: readonly Project[] }) {
  return (
    <ul className="flex flex-col gap-6">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.name}
          project={project}
          priority={index === 0}
        />
      ))}
    </ul>
  );
}
