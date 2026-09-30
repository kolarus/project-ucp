import { PageHeader, PageSection, TextLink } from "@/shared/ui";

/** The 404 page. */
export function NotFoundView() {
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
