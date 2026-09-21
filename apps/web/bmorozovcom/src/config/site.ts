/**
 * Who this site is for and what to download. Page content lives alongside it in
 * `navigation.ts`, `about.ts`, `contact.ts` and `projects.ts`.
 */

export const siteConfig = {
  name: "Bohdan Morozov",
  description:
    "Software engineer and independent contractor with 9+ years building frontend and mobile products.",
  url: "https://bmorozov.com",
  /** The monorepo every project here lives in. */
  repoUrl: "https://github.com/kolarus/project-ucp",
} as const;

/**
 * The CV lives in `public/cv/`. To publish a new one, drop the file in, point
 * `href` at it and bump `updated` — nothing else references the path.
 */
export const cv = {
  /** Path under `public/`, not an app route. */
  href: "/cv/CV_Bohdan_Morozov.pdf",
  /** Filename the browser saves it as. */
  fileName: "CV_Bohdan_Morozov.pdf",
  updated: "July 2026",
} as const;
