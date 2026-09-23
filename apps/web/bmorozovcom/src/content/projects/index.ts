import type { ComponentType } from "react";

import type { Project } from "@/config/projects";
import { PersonalWebsite } from "@/content/projects/personal-website";

/**
 * Each project's long-form page content, by slug. Facts that also appear on
 * the card (name, stack, links) live in `src/config/projects.ts`; this is the
 * write-up only that project's page needs.
 */
export const projectContent: Record<
  string,
  ComponentType<{ project: Project }>
> = {
  "personal-website": PersonalWebsite,
};
