import type { RouteConfig } from "@phantom/shared";
import { getActiveRoutes } from "./config.ts";
import type { MockRequest } from "./parser.ts";

export interface MockResponse {
  status: number;
  message: string;
  body: unknown;
  params: Record<string, string>;
  delay?: number;
  errorRate?: number;
  headers?: Record<string, string>;
}

export function handleRouting(request: MockRequest, customRoutes?: RouteConfig[]): MockResponse {
  if (!hasValidEncoding(request.path)) {
    return { status: 400, message: "Bad Request", body: { error: `Path ${request.path} has invalid percent-encoding` }, params: {} };
  }

  const routes = customRoutes || getActiveRoutes();

  for (const route of routes) {
    if (route.enabled === false) continue;
    if (!methodMatches(route.method, request.method)) continue;

    const params = matchPath(route.path, request.path);
    if (params) {
      return {
        status: route.status,
        message: "OK",
        body: route.body,
        params,
        delay: route.delay,
        errorRate: route.errorRate,
        headers: route.headers || {},
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
 * Compares HTTP methods, ignoring case. A route with no method answers GET.
 */
function methodMatches(routeMethod: string | undefined, requestMethod: string) {
  return (routeMethod ?? "GET").toUpperCase() === requestMethod.toUpperCase();
}

/**
 * Checks that the path part of a request path can be percent-decoded.
 */
function hasValidEncoding(requestPath: string) {
  try {
    decodeURIComponent(requestPath.split("?")[0] ?? "");
    return true;
  } catch {
    return false;
  }
}

/**
 * Escapes the characters that have a special meaning in a regular expression.
 */
function escapeRegExp(text: string) {
  // "$&" puts back the character that matched, after the backslash.
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches a request path against a pattern like /users/:id.
 * Everything except the :params matches literally.
 */
function matchPath(pattern: string, actualPath: string) {
  const paramNames: string[] = [];
  const regexPath = escapeRegExp(pattern).replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
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
