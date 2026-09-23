import { siteConfig } from "@/config/site";

export type Project = {
  /** URL segment for the project's own pages, e.g. its architecture diagram. */
  slug: string;
  name: string;
  /** One or two lines on what it is. */
  description: string;
  /** Why it exists. */
  purpose: string;
  tech: readonly string[];
  /** How it's built, shipped and served. Omit for projects without a pipeline. */
  infra?: readonly string[];
  /** Display date, e.g. "September 2026". */
  updated: string;
  /** Where the card links to: the live thing, or its source. */
  href: string;
  /** Screenshot in `public/projects/`. */
  image: { src: string; alt: string };
  /** Architecture diagram in `public/projects/`, shown on its own page. */
  diagram?: { src: string; width: number; height: number };
};

export const projects: readonly Project[] = [
  {
    slug: "personal-website",
    name: "Personal website",
    description:
      "This site. Server-rendered pages, built as a container and deployed on every push to main — the commit in the footer is the one running.",
    purpose: "Somewhere to point people at, and to keep the CV current.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    infra: [
      "Docker",
      "Terraform",
      "AWS EC2",
      "Amazon ECR",
      "GitHub Actions",
      "Caddy",
      "Cloudflare DNS + proxy",
      "pnpm monorepo",
    ],
    updated: "September 2026",
    href: siteConfig.url,
    image: {
      // Date-stamped so a new screenshot can never be served from cache.
      src: "/projects/personal-website-2026-09.jpg",
      alt: "The about page of this site: heading, intro, stats row and side links.",
    },
    diagram: {
      src: "/projects/personal-website-architecture.svg",
      width: 1120,
      height: 660,
    },
  },
];
