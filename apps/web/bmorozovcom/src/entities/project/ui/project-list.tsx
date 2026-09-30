import type { Project } from "../model/projects";
import { ProjectCard } from "./project-card";

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
