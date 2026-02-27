import type { MockRequest } from "./parser.ts";

export function handleRouting(request: MockRequest) {
  const routes = [
    { path: "/health", response: { response: "All good!" } },
    { path: "/users/:id", response: (params: any) => ({ id: params.id, role: "mock-user" }) },
  ];

  for (const route of routes) {
    const params = matchPath(route.path, request.path);
    if (params) {
      // If response is a function, call it with params
      const body = typeof route.response === "function" ? route.response(params) : route.response;

      return { status: 200, message: "OK", body, params };
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
