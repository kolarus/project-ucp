import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Emits .next/standalone: the server plus only the traced node_modules it
  // actually needs, which is what the Docker image runs.
  output: "standalone",
  // Dependencies are installed at the pnpm workspace root, so tracing starts
  // there; the standalone output nests the app under apps/web/jobsbmorozovcom.
  outputFileTracingRoot: path.join(__dirname, "../../.."),
};

export default nextConfig;
