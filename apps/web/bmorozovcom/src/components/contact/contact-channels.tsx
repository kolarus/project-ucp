import { CopyButton } from "@/components/ui/copy-button";
import type { ContactChannel } from "@/config/contact";

/** The platforms to reach out through, as linked cards. */
export function ContactChannels({
  channels,
}: {
  channels: readonly ContactChannel[];
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {channels.map((channel) => {
        const isExternal = channel.href.startsWith("http");

        return (
          // The copy button sits beside the card link rather than inside it:
          // a button can't be nested in an anchor.
          <li key={channel.label} className="relative flex">
            <a
              href={channel.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="flex w-full flex-col gap-1 rounded-xl border border-border p-5 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="text-sm text-muted">{channel.label}</span>
              <span className="text-base font-medium break-all">
                {channel.handle}
              </span>
              <span className="text-sm text-muted">{channel.description}</span>
            </a>
            {channel.copyable ? (
              <CopyButton
                value={channel.handle}
                label={channel.label}
                className="absolute top-3 right-3"
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
