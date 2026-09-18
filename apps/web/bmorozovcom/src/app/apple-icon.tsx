import { initialsIcon } from "@/lib/initials-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return initialsIcon(size.width);
}
