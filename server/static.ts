import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function handleStaticFile(requestPath: string) {
  let cleanPath = requestPath.split("?")[0] || "/";
  if (cleanPath === "/") cleanPath = "/index.html";

  const buildDir = path.join(__dirname, "dashboard-ui");
  let filePath = path.join(buildDir, cleanPath);

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    return {
      body: content,
      headers: { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" },
    };
  } catch {
    // SPA fallback, if file not found, try index.html
    try {
      const indexContent = await fs.readFile(path.join(buildDir, "index.html"));
      return { body: indexContent, headers: { "Content-Type": "text/html" } };
    } catch {
      return null;
    }
  }
}
