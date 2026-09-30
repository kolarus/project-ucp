// Visual snapshots only (ADR-0008): no user flows. Run `pnpm test:visual` from
// the repository root, which runs this inside the pinned Playwright image.
import { defineConfig, devices } from "@playwright/test";

// Baselines are Linux screenshots, so anywhere else the run stops before the
// build. (A throw here would also break tools that load this file, like knip.)
const notLinux =
  'echo "Run pnpm test:visual from the repository root: baselines are Linux screenshots." >&2; exit 1';

const port = 3000;

export default defineConfig({
  testDir: "tests/visual",
  // Baselines are only ever taken in the Linux image, so no platform suffix.
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  outputDir: "test-results",
  forbidOnly: true,
  retries: 0,
  timeout: 60_000,
  reporter: "list",
  // Any colour change counts. Playwright's default (0.2) ignores per-pixel
  // differences that small: a heading turned from #171717 to #333333 passed.
  // Only pixels its anti-aliasing detection flags are still ignored.
  expect: { toHaveScreenshot: { threshold: 0 } },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${port}`,
    // Stops looping animations; the "open to work" pulse is hidden.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // The production build, as Next's testing guide recommends.
  webServer: {
    command:
      process.platform === "linux" ? "pnpm build && pnpm start" : notLinux,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    // Build output explains a failed start.
    stdout: "pipe",
    timeout: 300_000,
    // Empty values win over .env.local (Next only fills unset variables): no
    // analytics, no stats data, no deploy line in the footer.
    env: {
      NEXT_PUBLIC_AMPLITUDE_API_KEY: "",
      AMPLITUDE_SECRET_KEY: "",
      NEXT_PUBLIC_GIT_SHA: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
