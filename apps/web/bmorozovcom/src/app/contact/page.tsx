import type { Metadata } from "next";

import { ContactChannels } from "@/components/contact/contact-channels";
import { LanguageList } from "@/components/contact/language-list";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection } from "@/components/ui/page-section";
import { Prose } from "@/components/ui/prose";
import { DownloadCv } from "@/components/ui/download-cv";
import { Section } from "@/components/ui/section";
import { contactChannels, languages } from "@/config/contact";

const title = "Contact me";
const description = "How to get in touch, and the languages I work in.";

export const metadata: Metadata = { title, description };

export default function ContactPage() {
  return (
    <PageSection>
      <PageHeader title={title} />
      <Prose>
        <p>
          If you have a project in mind, want to ask me about something I’ve
          worked on, think I might be a good fit for an open position, or simply
          want to get in touch, feel free to reach out through any of the
          platforms listed below.
        </p>
      </Prose>
      <ContactChannels channels={contactChannels} />
      <DownloadCv />
      <Section title="Languages">
        <Prose>
          <p>
            I work in English day to day, and I’m fluent in Ukrainian and
            Russian, so I’m comfortable in any of the three. I also understand
            Polish well, although I’m not yet confident enough speaking it to
            use it professionally.
          </p>
        </Prose>
        <LanguageList languages={languages} />
      </Section>
    </PageSection>
  );
}
