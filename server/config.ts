import * as fs from "node:fs";
import * as path from "node:path";
import { styleText } from "node:util";

const CONFIG_PATH = path.join(process.cwd(), "routes.json");

export interface RouteConfig {
  path: string;
  status: number;
  body: any;
}

export function loadRoutes(): RouteConfig[] {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      console.log(styleText("yellow", "[Config] routes.json not found. using empty defaults."));
      return [];
    }

    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const routes = JSON.parse(raw);
    console.log(styleText("blue", `[Config] Loaded ${routes.length} routes from JSON`));
    return routes;
  } catch (error) {
    console.error(styleText("red", "[Config] Failed to parse routes.json"));
    return [];
  }
}
