import * as fs from "node:fs";
import * as path from "node:path";
import type { RouteConfig } from "@phantom/shared";
import type { RouteStore } from "./routeStore.ts";
import { logger } from "./logger.ts";

/**
 * Reads, writes and watches a routes file, and keeps the route store in step with it.
 */
export class RoutesFile {
  readonly filePath: string;
  private readonly store: RouteStore;
  private watcher: fs.FSWatcher | null = null;
  private watchTimeout: NodeJS.Timeout | null = null;

  /**
   * @param filePath - the routes file, absolute or relative to the current folder
   */
  constructor(filePath: string, store: RouteStore) {
    this.filePath = path.resolve(filePath);
    this.store = store;
  }

  /**
   * Loads the routes from the file into the store. When the file is missing, the store keeps its current routes.
   */
  load() {
    if (!fs.existsSync(this.filePath)) {
      logger.warn(`[Config] No routes file found at ${this.filePath}. Run "phantom init" to create one.`);
      return;
    }

    try {
      const routes: RouteConfig[] = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      this.store.setRoutes(routes);
      logger.config(`Successfully reloaded ${routes.length} routes from ${path.basename(this.filePath)}`);
    } catch {
      logger.error(`Couldn't load ${this.filePath}. Keeping the previous routes.`);
    }
  }

  /**
   * Writes the routes to the file and puts them in the store.
   */
  write(routes: RouteConfig[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(routes, null, 2), "utf-8");
    logger.config(`Wrote ${routes.length} routes to ${path.basename(this.filePath)}`);
    this.store.setRoutes(routes);
  }

  /**
   * Loads the file again whenever it's created, changed or deleted.
   */
  watch() {
    const fileName = path.basename(this.filePath);

    // Watch the folder, not the file, because fs.watch fails on a file that doesn't exist yet.
    this.watcher = fs.watch(path.dirname(this.filePath), (_eventType, changedFile) => {
      if (changedFile !== fileName) return;

      // Editors can send more than one event for one save, so wait for them to stop.
      if (this.watchTimeout) clearTimeout(this.watchTimeout);

      this.watchTimeout = setTimeout(() => {
        this.load();
        this.watchTimeout = null;
      }, 300);
    });
  }

  stopWatching() {
    this.watcher?.close();
    if (this.watchTimeout) clearTimeout(this.watchTimeout);
  }
}
