import { initialsIcon } from "@/lib/initials-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return initialsIcon(size.width);
}
