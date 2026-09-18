import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { TextLink } from "@/components/ui/text-link";

// `not-found.tsx` does not support a `metadata` export; only `global-not-found`
// does. The title falls back to the root layout default.
export default function NotFound() {
  return (
    <PageSection>
      <PageHeader
        title="Page not found"
        description="That page doesn't exist, or it moved."
      />
      <div>
        <TextLink href="/">Back to About me</TextLink>
      </div>
    </PageSection>
  );
}
