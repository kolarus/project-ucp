// eslint-config-next pins to the Next.js release: bump it here together with
// `next` in the apps.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Next's recommended rules plus a few type-aware ones that catch real bugs.
 *
 * @param {{ tsconfigRootDir: string }} options The app's directory, where its
 *   tsconfig.json lives; type-aware rules need it.
 */
export function nextjs({ tsconfigRootDir }) {
  return defineConfig([
    ...nextVitals,
    ...nextTs,
    {
      files: ["**/*.{ts,tsx,mts}"],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        // A promise nobody awaits or handles fails silently.
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/await-thenable": "error",
        // A new member of a union (a page state, a range) must be handled
        // everywhere the union is switched on.
        "@typescript-eslint/switch-exhaustiveness-check": [
          "error",
          { considerDefaultExhaustiveForUnions: true },
        ],
        // Type-only imports are erased, so they can't pull server code into a
        // client bundle.
        "@typescript-eslint/consistent-type-imports": "error",
      },
    },
    globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "test-results/**",
    ]),
  ]);
}
