import * as fs from "node:fs";
import * as path from "node:path";
import { styleText } from "node:util";

let CONFIG_PATH = path.join(process.cwd(), "routes.json");

export function setConfigPath(newPath: string) {
  CONFIG_PATH = path.isAbsolute(newPath) ? newPath : path.join(process.cwd(), newPath);
}

export interface RouteConfig {
  path: string;
  method: string;
  status: number;
  body: any;
  enabled: boolean;
  delay: number;
  errorRate: number;
  headers: Record<string, string>;
}

let activeRoutes: RouteConfig[] = [];

export function getActiveRoutes() {
  return activeRoutes;
}

export function reloadRoutes() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      activeRoutes = [];
      return;
    }

    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    activeRoutes = JSON.parse(raw);
    console.log(styleText("blue", `[Config] Successfully reloaded ${activeRoutes.length} routes from ${path.basename(CONFIG_PATH)}`));
  } catch (error) {
    console.error(styleText("red", `[Config] Error reloading ${CONFIG_PATH}. Keeping previous version.`));
  }
}

let watchTimeout: NodeJS.Timeout | null = null;

export function watchConfig(onReload: () => void) {
  fs.watch(CONFIG_PATH, (eventType) => {
    if (eventType === "change") {
      // editors could run multiple "change" events, debounce them
      if (watchTimeout) clearTimeout(watchTimeout);

      watchTimeout = setTimeout(() => {
        reloadRoutes();
        onReload();
        watchTimeout = null;
      }, 300);
    }
  });
}

export function writeRoutes(routes: RouteConfig[]) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(routes, null, 2), "utf-8");
  console.log(styleText("blue", `[Config] Wrote ${routes.length} routes to ${path.basename(CONFIG_PATH)}`));
}

reloadRoutes();
