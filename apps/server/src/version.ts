import { readFileSync } from "node:fs";

/**
 * Reads Phantom's version from its package.json. The same relative path works from src in development and from dist when published.
 */
export function readVersion(): string {
  const packageJSON: unknown = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
  if (typeof packageJSON === "object" && packageJSON !== null && "version" in packageJSON && typeof packageJSON.version === "string") {
    return packageJSON.version;
  }
  return "0.0.0";
}
