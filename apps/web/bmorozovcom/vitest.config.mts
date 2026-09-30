import { defineConfig } from "vitest/config";

export default defineConfig({
  // Unit tests sit next to the code they guard; tests/visual/ is Playwright's.
  test: { include: ["src/**/*.test.ts"] },
});
