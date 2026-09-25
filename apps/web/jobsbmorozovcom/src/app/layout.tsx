import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobs.bmorozov.com"),
  title: {
    default: "Jobs",
    template: "%s · Jobs",
  },
  description:
    "Track job applications on a simple board and see your hiring funnel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
