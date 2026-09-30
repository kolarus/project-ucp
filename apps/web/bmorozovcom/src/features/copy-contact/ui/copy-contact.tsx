import type { ContactChannel } from "@/entities/contact-channel";
import { trackClick } from "@/shared/analytics";
import { CopyButton } from "@/shared/ui";

/** Copies a channel's handle; counted as a contact click, `action: "copy"`. */
export function CopyContact({
  channel,
  className,
}: {
  channel: ContactChannel;
  className?: string;
}) {
  return (
    <CopyButton
      value={channel.handle}
      label={channel.label}
      tracking={trackClick("contact_clicked", {
        type: channel.label.toLowerCase(),
        action: "copy",
      })}
      className={className}
    />
  );
}
