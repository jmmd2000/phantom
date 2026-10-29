import { getActiveRoutes, writeRoutes } from "./config.ts";
import type { MockRequest } from "./parser.ts";
import type { MockResponse } from "./router.ts";

/**
 * Answers the dashboard's /_admin endpoints. Returns null for any other request, including unknown /_admin paths.
 */
export function handleAdmin(request: MockRequest, version: string): MockResponse | null {
  if (request.path === "/_admin/version" && request.method === "GET") {
    return { status: 200, message: "OK", body: { version }, params: {} };
  }

  if (request.path === "/_admin/routes" && request.method === "GET") {
    return { status: 200, message: "OK", body: getActiveRoutes(), params: {} };
  }

  if (request.path === "/_admin/routes" && request.method === "PUT") {
    const routes = JSON.parse(request.body.toString("utf-8"));
    writeRoutes(routes);
    return { status: 200, message: "OK", body: { success: true }, params: {} };
  }

  if (request.path === "/_admin/clear" && request.method === "POST") {
    return { status: 200, message: "OK", body: { success: true }, params: {} };
  }

  return null;
}
