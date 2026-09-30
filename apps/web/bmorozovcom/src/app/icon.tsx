import { siteConfig } from "@/shared/config";
import { initialsIcon } from "@/shared/ui";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return initialsIcon(siteConfig.name, size.width);
}
