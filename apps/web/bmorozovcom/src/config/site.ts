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
 * The CV lives in `public/cv/` under a date-stamped name, so a new one gets a
 * new URL and can't be served stale from Cloudflare or browser caches. To
 * publish one: add the file, point `href` at it, bump `updated`, and delete
 * the old file. `/cv` and the original `/cv/CV_Bohdan_Morozov.pdf` redirect
 * to `href` (see `next.config.ts`), so links already shared keep working.
 */
export const cv = {
  /** Path under `public/`, not an app route. */
  href: "/cv/CV_Bohdan_Morozov_2026-09.pdf",
  /** Filename the browser saves it as. */
  fileName: "CV_Bohdan_Morozov.pdf",
  updated: "September 2026",
} as const;
