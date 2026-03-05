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
  const isDashboardBase = requestPath.startsWith("/_dashboard");
  const isAppAsset = requestPath.startsWith("/_app");
  const isPhantomSVG = requestPath === "/phantom.svg";

  if (!isDashboardBase && !isAppAsset && !isPhantomSVG) return null;

  let cleanPath = requestPath;
  if (isDashboardBase) {
    cleanPath = requestPath.replace("/_dashboard", "");
  }

  if (cleanPath === "" || cleanPath === "/") cleanPath = "/index.html";

  // check production path first, then development path
  const paths = [path.join(__dirname, "dashboard-ui", cleanPath), path.join(__dirname, "../dashboard/build", cleanPath)];

  for (const filePath of paths) {
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      return {
        body: content,
        headers: {
          "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        },
      };
    } catch {
      continue;
    }
  }

  // SPA fallback for /_dashboard sub-routes
  const fallbackPaths = [path.join(__dirname, "dashboard-ui", "index.html"), path.join(__dirname, "../dashboard/build", "index.html")];

  for (const fallback of fallbackPaths) {
    try {
      const indexContent = await fs.readFile(fallback);
      return { body: indexContent, headers: { "Content-Type": "text/html" } };
    } catch {
      continue;
    }
  }

  return null;
}
