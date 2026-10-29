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

/** The published build first, then the repo build during development. */
const DASHBOARD_FOLDERS = [path.join(__dirname, "dashboard-ui"), path.join(__dirname, "../../dashboard/build")];

/**
 * Decodes a request path and joins it onto the folder.
 * Returns null when the path can't be decoded or ends up outside the folder.
 */
function resolveInside(folder: string, requestPath: string): string | null {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }

  const filePath = path.join(folder, decodedPath);
  const isInside = filePath === folder || filePath.startsWith(folder + path.sep);
  return isInside ? filePath : null;
}

/**
 * Finds the dashboard file for a request. Returns null when the request isn't for the dashboard,
 * or when its path leaves the dashboard folder, so the request ends in a 404.
 */
export async function handleStaticFile(requestPath: string, folders: string[] = DASHBOARD_FOLDERS) {
  const isDashboardBase = requestPath.startsWith("/_dashboard");
  const isAppAsset = requestPath.startsWith("/_app");
  const isPhantomSVG = requestPath === "/phantom.svg";

  if (!isDashboardBase && !isAppAsset && !isPhantomSVG) return null;

  let cleanPath = requestPath;
  if (isDashboardBase) {
    cleanPath = requestPath.replace("/_dashboard", "");
  }

  if (cleanPath === "" || cleanPath === "/") cleanPath = "/index.html";

  for (const folder of folders) {
    const filePath = resolveInside(folder, cleanPath);
    if (!filePath) return null;

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
  for (const folder of folders) {
    try {
      const indexContent = await fs.readFile(path.join(folder, "index.html"));
      return { body: indexContent, headers: { "Content-Type": "text/html" } };
    } catch {
      continue;
    }
  }

  return null;
}
