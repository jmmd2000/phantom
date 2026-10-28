import { readFileSync } from "node:fs";

/**
 * Prints the changelog entry for one version, without its heading.
 * Exits with code 1 when the changelog has no entry for that version.
 *
 * Usage: node scripts/changelogEntry.js 0.2.4
 */
const version = process.argv[2];
const lines = readFileSync("CHANGELOG.md", "utf-8").split("\n");

const start = lines.findIndex(line => line.startsWith(`## [${version}]`));
if (start === -1) {
  console.error(`CHANGELOG.md has no entry for ${version}`);
  process.exit(1);
}

// The next version heading ends an entry. So do the version links at the bottom of the file.
const isEntryEnd = line => line.startsWith("## [") || /^\[.+\]: /.test(line);

const linesAfterHeading = lines.slice(start + 1);
const end = linesAfterHeading.findIndex(isEntryEnd);
const entry = end === -1 ? linesAfterHeading : linesAfterHeading.slice(0, end);

process.stdout.write(`${entry.join("\n").trim()}\n`);
