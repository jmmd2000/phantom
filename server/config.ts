import * as fs from "node:fs";
import * as path from "node:path";
import { styleText } from "node:util";

const CONFIG_PATH = path.join(process.cwd(), "routes.json");

export interface RouteConfig {
  path: string;
  method: string;
  status: number;
  body: any;
  enabled: boolean;
  delay: number;
  errorRate: number;
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
    console.log(styleText("blue", `[Config] Successfully reloaded ${activeRoutes.length} routes`));
  } catch (error) {
    console.error(styleText("red", "[Config] Error reloading routes.json. Keeping previous version."));
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
      }, 100);
    }
  });
}

export function writeRoutes(routes: RouteConfig[]) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(routes, null, 2), "utf-8");
  console.log(styleText("blue", `[Config] Wrote ${routes.length} routes to disk`));
}

reloadRoutes();
