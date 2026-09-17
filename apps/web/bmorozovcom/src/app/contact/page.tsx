import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Placeholder } from "@/components/ui/placeholder";

export const metadata: Metadata = {
  title: "Contact me",
  description: "How to get in touch.",
};

export default function ContactPage() {
  return (
    <PageSection>
      <PageHeader
        title="Contact me"
        description="Placeholder — how to get in touch."
      />
      <Placeholder label="Contact details placeholder" />
    </PageSection>
  );
}
