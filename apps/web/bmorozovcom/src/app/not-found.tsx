import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";

export default function NotFound() {
  return (
    <PageSection>
      <PageHeader
        title="Page not found"
        description="That page doesn't exist, or it moved."
      />
      <Link href="/" className="text-sm font-medium underline underline-offset-4">
        Back to home
      </Link>
    </PageSection>
  );
}
