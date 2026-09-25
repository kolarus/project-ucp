import path from "node:path";

import type { NextConfig } from "next";

import { cv } from "./src/config/site";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Emits .next/standalone: the server plus only the traced node_modules it
  // actually needs, which is what the Docker image runs.
  output: "standalone",
  // This app carries its own lockfile, so trace from here. Without it Next
  // walks up to the repo root and nests the output under apps/web/bmorozovcom.
  outputFileTracingRoot: path.join(__dirname),

  async redirects() {
    return [
      // A stable short link to whichever CV is current, and the original
      // undated URL for links shared before CVs were date-stamped. Temporary
      // (307), so publishing a new CV repoints them immediately.
      { source: "/cv", destination: cv.href, permanent: false },
      {
        source: "/cv/CV_Bohdan_Morozov.pdf",
        destination: cv.href,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
