import { getActiveRoutes, writeRoutes, type RouteConfig } from "./config.ts";
import type { MockRequest } from "./parser.ts";

export function handleRouting(request: MockRequest, customRoutes?: RouteConfig[]) {
  if (request.path === "/_admin/routes" && request.method === "GET") {
    return { status: 200, message: "OK", body: getActiveRoutes(), params: {} };
  }

  if (request.path === "/_admin/routes" && request.method === "PUT") {
    const routes = JSON.parse(request.body.toString("utf-8"));
    writeRoutes(routes);
    return { status: 200, message: "OK", body: { success: true }, params: {} };
  }

  const routes = customRoutes || getActiveRoutes();

  for (const route of routes) {
    if (route.enabled === false) continue;

    const params = matchPath(route.path, request.path);
    if (params) {
      return {
        status: route.status,
        message: "OK",
        body: route.body,
        params,
      };
    }
  }

  return {
    status: 404,
    message: "Not Found",
    body: { error: `Route ${request.path} not found` },
    params: {},
  };
}

/**
 * Matches a request path against a pattern like /users/:id.
 */
function matchPath(pattern: string, actualPath: string) {
  const paramNames: string[] = [];
  const regexPath = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });

  const regex = new RegExp(`^${regexPath}$`);
  const match = actualPath.split("?")[0]?.match(regex);

  if (!match) return null;

  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    params[name] = decodeURIComponent(match[i + 1] || "");
  });

  return params;
}
