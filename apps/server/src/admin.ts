import type { MockRequest } from "./parser.ts";
import type { MockResponse } from "./router.ts";
import type { RouteStore } from "./routeStore.ts";
import type { RoutesFile } from "./routesFile.ts";

/** What the admin endpoints need from the server. */
export interface AdminContext {
  version: string;
  store: RouteStore;
  /** The routes file that changes are written to, or null when the routes live only in memory. */
  routesFile: RoutesFile | null;
}

/**
 * Answers the dashboard's /_admin endpoints. Returns null for any other request, including unknown /_admin paths.
 */
export function handleAdmin(request: MockRequest, context: AdminContext): MockResponse | null {
  if (request.path === "/_admin/version" && request.method === "GET") {
    return { status: 200, message: "OK", body: { version: context.version }, params: {} };
  }

  if (request.path === "/_admin/routes" && request.method === "GET") {
    return { status: 200, message: "OK", body: context.store.getRoutes(), params: {} };
  }

  if (request.path === "/_admin/routes" && request.method === "PUT") {
    const routes = JSON.parse(request.body.toString("utf-8"));
    if (context.routesFile) {
      context.routesFile.write(routes);
    } else {
      context.store.setRoutes(routes);
    }
    return { status: 200, message: "OK", body: { success: true }, params: {} };
  }

  if (request.path === "/_admin/clear" && request.method === "POST") {
    return { status: 200, message: "OK", body: { success: true }, params: {} };
  }

  return null;
}
