import { siteConfig } from "@/shared/config";
import { initialsIcon } from "@/shared/ui";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return initialsIcon(siteConfig.name, size.width);
}
