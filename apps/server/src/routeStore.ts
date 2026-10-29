import type { RouteConfig } from "@phantom/shared";

/**
 * Holds the current routes. Every change goes through setRoutes(), which tells the listeners.
 */
export class RouteStore {
  private routes: RouteConfig[] = [];
  private readonly listeners: (() => void)[] = [];

  getRoutes() {
    return this.routes;
  }

  /**
   * Replaces the routes and tells the listeners. Does nothing when the new routes are the same as the current ones.
   */
  setRoutes(routes: RouteConfig[]) {
    if (JSON.stringify(routes) === JSON.stringify(this.routes)) return;

    this.routes = routes;
    for (const listener of this.listeners) {
      listener();
    }
  }

  onChange(listener: () => void) {
    this.listeners.push(listener);
  }
}
