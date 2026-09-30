// `pnpm check-architecture`: the structure rules of ADR-0009 that lint can't
// express, for every app's src/.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const LAYERS = ["app", "views", "features", "entities", "shared"];
const SLICED_LAYERS = ["views", "features", "entities"];
/** Folders inside a slice. `content` holds long-form write-ups (ADR-0011). */
const SLICE_SEGMENTS = ["ui", "model", "api", "lib", "content"];
const SHARED_SEGMENTS = ["ui", "lib", "config", "api", "analytics"];
/** A slice's public API: index.ts; server.ts for server-only code; client.ts
 * for browser-only code, imported by Next's instrumentation-client.ts. */
const ENTRY_POINTS = ["index.ts", "server.ts", "client.ts"];
/** Next's own files at the src root. */
const ROOT_FILES = [
  "instrumentation.ts",
  "instrumentation-client.ts",
  "proxy.ts",
];
/** File names Next gives a meaning to inside app/ (without extension). */
const ROUTE_FILES = new Set([
  "page",
  "layout",
  "template",
  "default",
  "loading",
  "error",
  "not-found",
  "global-error",
  "global-not-found",
  "forbidden",
  "unauthorized",
  "route",
  "icon",
  "apple-icon",
  "opengraph-image",
  "twitter-image",
  "sitemap",
  "robots",
  "manifest",
  "favicon",
  "globals",
]);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)*$/;
/** Dynamic segments, route groups and parallel-route slots. */
const ROUTE_FOLDER =
  /^(\[{1,2}(\.\.\.)?[a-z0-9-]+\]{1,2}|\([a-z0-9-]+\)|@[a-z0-9-]+)$/;

const problems: string[] = [];
const files = execFileSync(
  "git",
  [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    "apps/web/*/src/*",
  ],
  { cwd: root, encoding: "utf8" },
)
  .split("\n")
  .filter((file) => file && existsSync(join(root, file)));

const slices = new Map<string, string[]>(); // "apps/web/x/src/layer/slice" → files inside

for (const file of files) {
  const [, , app, , ...path] = file.split("/");
  const fail = (problem: string) => problems.push(`${file}: ${problem}`);
  const [layer = "", slice = "", ...rest] = path;
  const name = path.at(-1) ?? "";
  const inApp = layer === "app";

  if (/\.(c|m)?jsx?$/.test(name)) fail("src/ is TypeScript only (ADR-0003).");

  path.forEach((part, index) => {
    const isFolder = index < path.length - 1;
    if (!KEBAB.test(part) && !(inApp && isFolder && ROUTE_FOLDER.test(part))) {
      fail(`"${part}" isn't kebab-case (ADR-0009).`);
    }
  });

  if (path.length === 1) {
    if (!ROOT_FILES.includes(name)) {
      fail(
        `src/ holds only the layers (${LAYERS.join(", ")}) and Next's ${ROOT_FILES.join(", ")} (ADR-0009).`,
      );
    }
    continue;
  }
  if (!LAYERS.includes(layer)) {
    fail(
      `unknown folder "${layer}"; src/ holds only the layers ${LAYERS.join(", ")} (ADR-0009).`,
    );
    continue;
  }

  const source = /\.tsx?$/.test(name)
    ? readFileSync(join(root, file), "utf8")
    : "";
  if (/^\s*["']use client["']/.test(source)) {
    if (
      !path.includes("ui") &&
      !(layer === "shared" && slice === "analytics")
    ) {
      fail(
        `"use client" only in ui/ files (and shared/analytics); keep routes, views' data, model, api and lib on the server (ADR-0009).`,
      );
    }
    if (/from\s+["'][^"']*\/server["']/.test(source)) {
      fail(
        `a "use client" file imports a server.ts entry point, which is server-only (ADR-0009).`,
      );
    }
  }

  if (inApp) {
    const base = name.replace(/\.[^.]+$/, "");
    if (!ROUTE_FILES.has(base) && !/\.test\.tsx?$/.test(name)) {
      fail(
        `app/ is routing only: Next's route files, no components or helpers; move this into a layer below (ADR-0009).`,
      );
    }
    continue;
  }

  if (rest.length === 0) {
    fail(
      `files belong inside a slice folder, not directly in src/${layer} (ADR-0009).`,
    );
    continue;
  }
  const key = ["apps/web", app, "src", layer, slice].join("/");
  slices.set(key, [...(slices.get(key) ?? []), rest.join("/")]);

  if (layer === "shared" && !SHARED_SEGMENTS.includes(slice)) {
    fail(
      `unknown shared segment "${slice}"; allowed: ${SHARED_SEGMENTS.join(", ")} (ADR-0009).`,
    );
  }
  if (rest.length > 1 && ENTRY_POINTS.includes(name)) {
    fail(
      `nested entry point; only the slice root has ${ENTRY_POINTS.join(", ")} (ADR-0009).`,
    );
  }
  if (SLICED_LAYERS.includes(layer)) {
    if (rest.length === 1 && !ENTRY_POINTS.includes(name)) {
      fail(
        `a slice root holds only its entry points; put code in a segment (${SLICE_SEGMENTS.join(", ")}) (ADR-0009).`,
      );
    }
    if (rest.length > 1 && !SLICE_SEGMENTS.includes(rest[0] ?? "")) {
      fail(
        `unknown segment "${rest[0] ?? ""}"; allowed: ${SLICE_SEGMENTS.join(", ")} (ADR-0009).`,
      );
    }
  }
}

// Barrels are only free if the bundler may skip their unused re-exports; without
// this, every page importing a slice ships all the client code behind it.
for (const manifest of execFileSync(
  "git",
  ["ls-files", "apps/web/*/package.json"],
  { cwd: root, encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)) {
  const { sideEffects } = JSON.parse(
    readFileSync(join(root, manifest), "utf8"),
  ) as { sideEffects?: unknown };
  if (JSON.stringify(sideEffects) !== JSON.stringify(["*.css"])) {
    problems.push(
      `${manifest}: must declare "sideEffects": ["*.css"] so unused re-exports are dropped from bundles (ADR-0009).`,
    );
  }
}

for (const [slice, inner] of slices) {
  if (!inner.some((file) => file === "index.ts" || file === "server.ts")) {
    problems.push(
      `${slice}: no public API; add an index.ts (or server.ts for server-only code) (ADR-0009).`,
    );
  }
  if (inner.every((file) => ENTRY_POINTS.includes(file))) {
    problems.push(`${slice}: empty slice, only entry points (ADR-0009).`);
  }
}

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  console.error(`\ncheck-architecture: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `check-architecture: ${files.length} files in ${slices.size} slices follow ADR-0009`,
);
