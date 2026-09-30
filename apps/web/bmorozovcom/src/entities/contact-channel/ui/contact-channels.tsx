import type { ReactNode } from "react";

import { trackClick } from "@/shared/analytics";

import type { ContactChannel } from "../model/channels";

/**
 * The platforms to reach out through, as linked cards. `accessory` fills a
 * slot in a card's top-right corner (the page puts a copy button there), so
 * this entity needn't know about features.
 */
export function ContactChannels({
  channels,
  accessory,
}: {
  channels: readonly ContactChannel[];
  accessory?: (channel: ContactChannel, className: string) => ReactNode;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {channels.map((channel) => {
        const isExternal = channel.href.startsWith("http");
        const type = channel.label.toLowerCase();

        return (
          // The accessory sits beside the card link rather than inside it:
          // a button can't be nested in an anchor.
          <li key={channel.label} className="relative flex">
            <a
              href={channel.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              {...trackClick("contact_clicked", { type, action: "open" })}
              className="flex w-full flex-col gap-1 rounded-xl border border-border p-5 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="text-sm text-muted">{channel.label}</span>
              <span className="text-base font-medium break-all">
                {channel.handle}
              </span>
              <span className="text-sm text-muted">{channel.description}</span>
            </a>
            {accessory?.(channel, "absolute top-3 right-3")}
          </li>
        );
      })}
    </ul>
  );
}
