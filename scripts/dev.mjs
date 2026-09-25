// `pnpm dev` asks which workspace app to start; `pnpm dev <app>` (a unique prefix is enough) doesn't.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const root = join(import.meta.dirname, "..");
const apps = JSON.parse(
  execFileSync("pnpm", ["ls", "--recursive", "--depth", "-1", "--json"], {
    cwd: root,
    encoding: "utf8",
  }),
)
  .filter((project) => project.path !== root)
  .map(({ name, path }) => ({
    name,
    dev: JSON.parse(readFileSync(join(path, "package.json"), "utf8")).scripts?.dev,
  }))
  .filter((app) => app.dev);
const choices = [...apps.map((app) => app.name), "all"];

function match(input) {
  if (!input) return undefined;
  if (choices.includes(input)) return input;
  const byPrefix = choices.filter((choice) => choice.startsWith(input));
  return choices[Number(input) - 1] ?? (byPrefix.length === 1 ? byPrefix[0] : undefined);
}

async function ask() {
  const width = Math.max(...choices.map((choice) => choice.length));
  console.log("Which app?");
  choices.forEach((choice, i) => {
    const detail = apps[i]?.dev ?? "all of the above, in parallel";
    console.log(`  ${i + 1}) ${choice.padEnd(width)}  ${detail}`);
  });
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.on("SIGINT", () => process.exit(130));
  let choice;
  while (!choice) choice = match((await rl.question(`App [1-${choices.length}]: `)).trim());
  rl.close();
  return choice;
}

const arg = process.argv[2];
const choice = arg ? match(arg) : process.stdin.isTTY ? await ask() : undefined;
if (!choice) {
  console.error(`Usage: pnpm dev [${choices.join(" | ")}]`);
  process.exit(1);
}

// Ctrl+C reaches the dev server directly; stay alive until it has shut down.
process.on("SIGINT", () => {});
const args = choice === "all" ? ["--recursive", "--parallel", "dev"] : ["--filter", choice, "dev"];
const { status } = spawnSync("pnpm", args, { stdio: "inherit" });
process.exit(status ?? 1);
