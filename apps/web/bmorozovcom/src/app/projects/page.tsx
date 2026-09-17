import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Placeholder } from "@/components/ui/placeholder";

export const metadata: Metadata = {
  title: "Projects",
  description: "Personal pet projects and experiments.",
};

export default function ProjectsPage() {
  return (
    <PageSection>
      <PageHeader
        title="Projects"
        description="Placeholder — personal pet projects and experiments."
      />
      <Placeholder label="Projects list placeholder" />
    </PageSection>
  );
}
