import { siteConfig } from "@/config/site";

export type Project = {
  name: string;
  /** One or two lines on what it is. */
  description: string;
  /** Why it exists. */
  purpose: string;
  tech: readonly string[];
  /** Display date, e.g. "September 2026". */
  updated: string;
  /** Where the card links to: the live thing, or its source. */
  href: string;
  /** Screenshot in `public/projects/`. */
  image: { src: string; alt: string };
};

export const projects: readonly Project[] = [
  {
    name: "Personal website",
    description:
      "This site: a small, server-rendered personal site with an about page, project list, and contact details.",
    purpose:
      "A place to point people at, and somewhere to keep the CV and contact details current.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    updated: "September 2026",
    href: siteConfig.url,
    image: {
      src: "/projects/personal-website.jpg",
      alt: "The about page of this site, showing the header, heading and intro text.",
    },
  },
];
