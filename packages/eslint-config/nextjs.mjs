// eslint-config-next pins to the Next.js release: bump it here together with
// `next` in the apps.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const SOURCE = ["src/**/*.{ts,tsx}"];

// ADR-0009: app → views → features → entities → shared. A layer imports only
// the layers below it; `shared` segments may import each other.
const LAYERS_BELOW = {
  app: ["view", "feature", "entity", "shared"],
  view: ["feature", "entity", "shared"],
  feature: ["entity", "shared"],
  entity: ["shared"],
  shared: ["shared"],
};

const boundaryPolicies = [
  // Other slices only through their public entry points: index.ts, and
  // server.ts for server-only code.
  ...Object.entries(LAYERS_BELOW).map(([from, to]) => ({
    from: { element: { type: from } },
    allow: {
      to: {
        element: { types: to, fileInternalPath: "{index,server}.ts" },
      },
    },
  })),
  // Inside one slice, anything goes (relative imports).
  ...Object.keys(LAYERS_BELOW).map((type) => ({
    from: { element: { type } },
    allow: {
      to: {
        element: {
          type,
          captured: { slice: "{{from.element.captured.slice}}" },
        },
      },
    },
  })),
];

/**
 * Next's recommended rules, a few type-aware ones that catch real bugs, and the
 * layer rules of ADR-0009.
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
    {
      files: SOURCE,
      plugins: { boundaries },
      settings: {
        // Next's own files at the src root, such as instrumentation-client.ts,
        // are wiring outside the layers. They're the only importers of a
        // browser-only client.ts entry point, which no layer may import.
        "boundaries/ignore": [
          "src/{instrumentation,instrumentation-client,proxy}.ts",
        ],
        "boundaries/elements": [
          { type: "app", pattern: "src/app" },
          { type: "view", pattern: "src/views/*", capture: ["slice"] },
          { type: "feature", pattern: "src/features/*", capture: ["slice"] },
          { type: "entity", pattern: "src/entities/*", capture: ["slice"] },
          { type: "shared", pattern: "src/shared/*", capture: ["slice"] },
        ],
      },
      rules: {
        "boundaries/dependencies": [
          "error",
          {
            default: "disallow",
            message:
              '{{from.element.types.[0]}} "{{from.element.captured.slice}}" may not import this ' +
              "{{to.element.types.[0]}} file. Layers import downward only " +
              "(app → views → features → entities → shared), never another slice " +
              "of the same layer, and other slices only through index.ts or " +
              "server.ts (ADR-0009).",
            policies: boundaryPolicies,
          },
        ],
        // Every file under src/ belongs to a layer (or is Next's own, above).
        "boundaries/no-unknown-files": "error",
        "import/no-cycle": "error",
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@amplitude/unified",
                message:
                  "The browser analytics SDK is used only in shared/analytics and instrumentation-client.ts (ADR-0010).",
              },
            ],
          },
        ],
        "no-restricted-globals": [
          "error",
          {
            name: "fetch",
            message: "Network access goes through shared/api (ADR-0009).",
          },
        ],
      },
    },
    {
      files: ["src/shared/analytics/**", "src/instrumentation-client.ts"],
      rules: { "no-restricted-imports": "off" },
    },
    {
      files: ["src/shared/api/**"],
      rules: { "no-restricted-globals": "off" },
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
