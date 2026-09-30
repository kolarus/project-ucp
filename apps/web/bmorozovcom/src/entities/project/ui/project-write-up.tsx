import type { ComponentType } from "react";

import { PersonalWebsite } from "../content/personal-website";
import type { Project } from "../model/projects";

/**
 * Each project's long-form page content, by slug. Facts that also appear on
 * the card (name, stack, links) live in `model/projects.ts`; this is the
 * write-up only that project's page needs.
 */
const writeUps: Record<string, ComponentType<{ project: Project }>> = {
  "personal-website": PersonalWebsite,
};

/** A project's write-up, if it has one. */
export function ProjectWriteUp({ project }: { project: Project }) {
  const WriteUp = writeUps[project.slug];
  return WriteUp ? <WriteUp project={project} /> : null;
}
