import type { Metadata } from "next";

import { ContactChannels, contactChannels } from "@/entities/contact-channel";
import { LanguageList, languages } from "@/entities/profile";
import { CopyContact } from "@/features/copy-contact";
import { DownloadCv } from "@/features/download-cv";
import { PageHeader, PageSection, Prose, Section } from "@/shared/ui";

const title = "Contact me";
const description = "How to get in touch, and the languages I work in.";

export const contactMetadata: Metadata = { title, description };

export function ContactView() {
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
      <ContactChannels
        channels={contactChannels}
        accessory={(channel, className) =>
          channel.copyable ? (
            <CopyContact channel={channel} className={className} />
          ) : null
        }
      />
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
