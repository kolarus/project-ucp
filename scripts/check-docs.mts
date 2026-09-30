// `pnpm check-docs`: the ADR log follows ADR-0001's rules, and no relative link
// in the repository's Markdown points at a file that doesn't exist.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const root = join(import.meta.dirname, "..");
const adrDir = "docs/adr";
const problems: string[] = [];

// Tracked and new files; git-ignored ones (internal_docs/, node_modules) skip.
const markdownFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--", "*.md"],
  { cwd: root, encoding: "utf8" },
)
  .split("\n")
  .filter((file) => file && existsSync(join(root, file)));

/** Text outside code, where `[x](y)` is a real link and not an example. */
function prose(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

let links = 0;
for (const file of markdownFiles) {
  const text = prose(readFileSync(join(root, file), "utf8"));
  for (const [, target = ""] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^[a-z]+:/i.test(target) || target.startsWith("#")) continue;
    links++;
    const path = target.replace(/[#?].*$/, "");
    if (!existsSync(join(root, dirname(file), decodeURIComponent(path)))) {
      problems.push(`${file}: broken link to ${target}`);
    }
  }
}

const requiredSections = [
  "Context",
  "Decision",
  "Alternatives considered",
  "Consequences",
  "Enforcement",
  "References",
];
const status =
  /^(proposed|accepted|deprecated|superseded by \[\d{4}\]\(\d{4}-[a-z0-9-]+\.md\))$/;
// ADR-0001: `monorepo`, or the domain of the project the decision is about.
const scope = /^(monorepo|[a-z0-9-]+(\.[a-z0-9-]+)+)$/;
const header = (text: string, field: string) =>
  text.match(new RegExp(`^- ${field}: (.+)$`, "m"))?.[1]?.trim();
/** `[0012](0012-x.md)` → `0012`, so a status reads the same in the index. */
const plain = (markdown: string) =>
  markdown.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

const adrs = markdownFiles
  .filter((file) => dirname(file) === adrDir && /^\d{4}-/.test(basename(file)))
  .sort();
const index = readFileSync(join(root, adrDir, "README.md"), "utf8");

adrs.forEach((file, position) => {
  const name = basename(file);
  const number = name.slice(0, 4);
  const text = readFileSync(join(root, file), "utf8");
  const fail = (problem: string) => problems.push(`${file}: ${problem}`);

  if (Number(number) !== position + 1) {
    fail(
      `numbered ${number}, expected ${String(position + 1).padStart(4, "0")} (no gaps)`,
    );
  }
  if (!text.startsWith(`# ${number}. `)) {
    fail(`title must start with "# ${number}. "`);
  }

  const fields = {
    Status: header(text, "Status"),
    Date: header(text, "Date"),
    Scope: header(text, "Scope"),
  };
  if (!fields.Status || !status.test(fields.Status)) {
    fail(
      `Status must be proposed, accepted, deprecated or "superseded by [NNNN](NNNN-title.md)"; got "${fields.Status ?? ""}"`,
    );
  }
  if (!fields.Date || !/^\d{4}-\d{2}-\d{2}\b/.test(fields.Date)) {
    fail("Date must start with YYYY-MM-DD");
  }
  if (!fields.Scope || !scope.test(fields.Scope)) {
    fail(
      `Scope must be "monorepo" or a project's domain; got "${fields.Scope ?? ""}"`,
    );
  }
  for (const section of requiredSections) {
    if (!new RegExp(`^## ${section}$`, "m").test(text)) {
      fail(`missing "## ${section}"`);
    }
  }

  const row = index
    .split("\n")
    .find((line) => line.startsWith(`| [${number}](${name}) |`));
  if (!row) {
    fail(`no row in ${adrDir}/README.md`);
    return;
  }
  const [, , , rowScope, rowStatus] = row.split("|").map((cell) => cell.trim());
  if (fields.Scope && rowScope !== fields.Scope) {
    fail(
      `index says scope "${rowScope ?? ""}", the ADR says "${fields.Scope}"`,
    );
  }
  if (fields.Status && rowStatus !== plain(fields.Status)) {
    fail(
      `index says status "${rowStatus ?? ""}", the ADR says "${plain(fields.Status)}"`,
    );
  }
});

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  console.error(`\ncheck-docs: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(
  `check-docs: ${adrs.length} ADRs in order and indexed; ${links} relative links in ${markdownFiles.length} Markdown files resolve`,
);
