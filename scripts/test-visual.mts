// `pnpm test:visual [app] [--update]`: full-page screenshots of every page,
// compared with the committed baselines (ADR-0008). Runs in the pinned
// Playwright image as linux/amd64, the same as CI, because font rendering
// differs between operating systems and CPU architectures.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Manifest = {
  name: string;
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const root = join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const update = args.includes("--update");
const only = args.find((arg) => !arg.startsWith("--"));

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const workspaces = ["apps/web", "packages"].flatMap((parent) =>
  readdirSync(join(root, parent), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${parent}/${entry.name}`)
    .filter((dir) => existsSync(join(root, dir, "package.json"))),
);
const apps = workspaces
  .map((dir) => ({
    dir,
    manifest: JSON.parse(
      readFileSync(join(root, dir, "package.json"), "utf8"),
    ) as Manifest,
  }))
  .filter(({ manifest }) => manifest.scripts?.["test:visual"]);

const selected = only
  ? apps.filter(({ manifest }) => manifest.name === only)
  : apps;
if (!selected.length) {
  fail(
    `Usage: pnpm test:visual [${apps.map(({ manifest }) => manifest.name).join(" | ")}] [--update]`,
  );
}

// The image is named after the Playwright version, so every app pins the same
// exact one.
const versions = new Set(
  apps.map(({ manifest }) => manifest.devDependencies?.["@playwright/test"]),
);
const [version] = versions;
if (versions.size !== 1 || !version || !/^\d+\.\d+\.\d+$/.test(version)) {
  fail("Every app must pin the same exact @playwright/test version.");
}

if (process.env.VISUAL_IN_CONTAINER === "1") {
  const failed = selected.filter(({ manifest }) => {
    const { status } = spawnSync(
      "pnpm",
      [
        "--filter",
        manifest.name,
        "test:visual",
        ...(update ? ["--update-snapshots=changed"] : []),
      ],
      { cwd: root, stdio: "inherit" },
    );
    return status !== 0;
  });
  if (failed.length) {
    fail(
      `\npnpm test:visual failed for ${failed.map(({ manifest }) => manifest.name).join(", ")}. ` +
        "For a screenshot mismatch, the expected, actual and diff images are in the " +
        "app's test-results/. If the change is intended, run `pnpm test:visual:update`, " +
        "review the new baselines and commit them.",
    );
  }
  process.exit(0);
}

// The container gets its own Linux node_modules and .next, in named volumes so
// installs and builds are cached between runs and the host's are untouched.
const volume = (path: string) =>
  `project-ucp-visual-${path.replaceAll("/", "-")}`;
const mounts = ["", ...workspaces.map((dir) => `${dir}/`)].flatMap((dir) => [
  "-v",
  `${volume(`${dir}node_modules`)}:/work/${dir}node_modules`,
]);
for (const { dir } of apps) {
  mounts.push("-v", `${volume(`${dir}/.next`)}:/work/${dir}/.next`);
}

const { status } = spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "--init",
    "--ipc=host",
    ...(process.stdin.isTTY ? ["-it"] : []),
    "--platform",
    "linux/amd64",
    "-v",
    `${root}:/work`,
    ...mounts,
    "-v",
    "project-ucp-visual-pnpm-store:/pnpm-store",
    "-v",
    "project-ucp-visual-corepack:/corepack",
    "-w",
    "/work",
    "-e",
    "VISUAL_IN_CONTAINER=1",
    "-e",
    "CI=1",
    "-e",
    "COREPACK_HOME=/corepack",
    "-e",
    "COREPACK_ENABLE_DOWNLOAD_PROMPT=0",
    "-e",
    "npm_config_store_dir=/pnpm-store",
    `mcr.microsoft.com/playwright:v${version}-noble`,
    "bash",
    "-c",
    // --ignore-scripts: the host's git hooks stay the host's.
    'corepack enable && pnpm install --frozen-lockfile --ignore-scripts && node scripts/test-visual.mts "$@"',
    "test-visual",
    ...args,
  ],
  { stdio: "inherit" },
);
process.exit(status ?? 1);
