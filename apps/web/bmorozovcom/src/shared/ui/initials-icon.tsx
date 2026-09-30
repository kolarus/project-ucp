import { ImageResponse } from "next/og";

/** Square initials mark ("Bohdan Morozov" → "BM"), for favicons. */
export function initialsIcon(name: string, size: number) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");

  return new ImageResponse(
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
    </div>,
    { width: size, height: size },
  );
}
