export type ContactChannel = {
  label: string;
  /** What's shown to the reader: an address, handle, or profile name. */
  handle: string;
  /** Absolute URL, or a `mailto:` link. */
  href: string;
  description: string;
  /** Offer a copy button — for handles people paste rather than open. */
  copyable?: boolean;
};

export const contactChannels: readonly ContactChannel[] = [
  {
    label: "Email",
    handle: "road2ps@gmail.com",
    href: "mailto:road2ps@gmail.com",
    description: "Best for anything detailed.",
    copyable: true,
  },
  {
    label: "LinkedIn",
    handle: "in/morozovb",
    href: "https://www.linkedin.com/in/morozovb/",
    description: "Work history and roles.",
  },
  {
    label: "GitHub",
    handle: "@kolarus",
    href: "https://github.com/kolarus",
    description: "Code and personal projects.",
  },
  {
    label: "Telegram",
    handle: "@kolarus",
    href: "https://t.me/kolarus",
    description: "Quickest for a short question.",
  },
];

export type Language = {
  name: string;
  level: string;
};

export const languages: readonly Language[] = [
  { name: "English", level: "Advanced" },
  { name: "Ukrainian", level: "Fluent" },
  { name: "Russian", level: "Fluent" },
  { name: "Polish", level: "Understand well, not yet professional" },
];
