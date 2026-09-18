import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Emits .next/standalone: the server plus only the traced node_modules it
  // actually needs, which is what the Docker image runs.
  output: "standalone",
  // This app carries its own lockfile, so trace from here. Without it Next
  // walks up to the repo root and nests the output under apps/web/bmorozovcom.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
