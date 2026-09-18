import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

/** "Bohdan Morozov" -> "BM". Follows the name in the site config. */
const initials = siteConfig.name
  .split(" ")
  .map((word) => word[0])
  .join("");

/** Square initials mark, shared by the favicon and the Apple touch icon. */
export function initialsIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#fafafa",
          fontSize: size * 0.46,
          fontWeight: 700,
          letterSpacing: size * -0.02,
        }}
      >
        {initials}
      </div>
    ),
    { width: size, height: size },
  );
}
