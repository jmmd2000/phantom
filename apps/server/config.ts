import * as fs from "node:fs";
import * as path from "node:path";
import { styleText } from "node:util";
import type { RouteConfig } from "@phantom/shared";

let CONFIG_PATH = path.join(process.cwd(), "routes.json");

export function setConfigPath(newPath: string) {
  CONFIG_PATH = path.isAbsolute(newPath) ? newPath : path.join(process.cwd(), newPath);
}

let activeRoutes: RouteConfig[] = [];

export function getActiveRoutes() {
  return activeRoutes;
}

/**
 * Loads the routes from the routes file. When the file is missing, it keeps the current routes.
 */
export function reloadRoutes() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log(styleText("yellow", `[Config] No routes file found at ${CONFIG_PATH}. Run "phantom init" to create one.`));
    return;
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    activeRoutes = JSON.parse(raw);
    console.log(styleText("blue", `[Config] Successfully reloaded ${activeRoutes.length} routes from ${path.basename(CONFIG_PATH)}`));
  } catch {
    console.error(styleText("red", `[Config] Error reloading ${CONFIG_PATH}. Keeping previous version.`));
  }
}

let watchTimeout: NodeJS.Timeout | null = null;

/**
 * Reloads the routes when the routes file is created, changed or deleted.
 */
export function watchConfig(onReload: () => void) {
  const fileName = path.basename(CONFIG_PATH);

  // Watch the folder, not the file, because fs.watch fails on a file that doesn't exist yet.
  fs.watch(path.dirname(CONFIG_PATH), (_eventType, changedFile) => {
    if (changedFile !== fileName) return;

    // Editors can send more than one event for one save, so wait for them to stop.
    if (watchTimeout) clearTimeout(watchTimeout);

    watchTimeout = setTimeout(() => {
      reloadRoutes();
      onReload();
      watchTimeout = null;
    }, 300);
  });
}

export function writeRoutes(routes: RouteConfig[]) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(routes, null, 2), "utf-8");
  console.log(styleText("blue", `[Config] Wrote ${routes.length} routes to ${path.basename(CONFIG_PATH)}`));
}
