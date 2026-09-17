import type { Route } from "next";

export const siteConfig = {
  name: "Bohdan Morozov",
  description: "Personal site of Bohdan Morozov.",
  url: "https://bmorozov.com",
} as const;

export type NavItem = {
  label: string;
  href: Route;
  /**
   * Top-level route segment as returned by `useSelectedLayoutSegment()`
   * from the root layout. `null` is the index route.
   */
  segment: string | null;
};

/** "About me" is the index route — the text logo points at the same place. */
export const mainNav: readonly NavItem[] = [
  { label: "About me", href: "/", segment: null },
  { label: "Projects", href: "/projects", segment: "projects" },
  { label: "Contact me", href: "/contact", segment: "contact" },
];
