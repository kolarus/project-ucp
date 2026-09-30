import { defineConfig } from "vitest/config";

export default defineConfig({
  // The same `@/…` aliases as the app (tsconfig.json paths).
  resolve: { tsconfigPaths: true },
  // Unit tests sit next to the code they guard; tests/visual/ is Playwright's.
  test: { include: ["src/**/*.test.ts"] },
});
