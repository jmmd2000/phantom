import { describe, it, expect } from "vitest";
import { handleRouting } from "../src/router.ts";
import type { MockRequest } from "../src/parser.ts";
import type { RouteConfig } from "@phantom/shared";

describe("handleRouting engine", () => {
  it("matches a dynamic path and returns params", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/test/:id",
        method: "GET",
        status: 200,
        body: {},
        enabled: true,
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];
    const req = { path: "/test/abc", method: "GET" } as MockRequest;

    const res = handleRouting(req, mockRoutes);

    expect(res.status).toBe(200);
    expect(res.params).toEqual({ id: "abc" });
  });

  it("handles non-matching paths correctly", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/only-one",
        method: "GET",
        status: 200,
        body: {},
        enabled: true,
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];
    const req = { path: "/something-else", method: "GET" } as MockRequest;

    const res = handleRouting(req, mockRoutes);

    expect(res.status).toBe(404);
  });

  it("matches multiple dynamic parameters", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/users/:id/posts/:postId",
        method: "GET",
        status: 200,
        enabled: true,
        body: {},
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];
    const req = { path: "/users/123/posts/456", method: "GET" } as MockRequest;

    const result = handleRouting(req, mockRoutes);
    expect(result.params).toEqual({ id: "123", postId: "456" });
  });

  it("decodes URL parameters correctly", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/search/:query",
        method: "GET",
        status: 200,
        enabled: true,
        body: {},
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];
    const req = { path: "/search/hello%20world", method: "GET" } as MockRequest;

    const result = handleRouting(req, mockRoutes);
    expect(result.params.query).toBe("hello world");
  });

  it("answers 400 for a path with invalid percent-encoding", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/users/:id",
        method: "GET",
        status: 200,
        enabled: true,
        body: {},
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];
    const req = { path: "/users/%E0", method: "GET" } as MockRequest;

    const result = handleRouting(req, mockRoutes);
    expect(result.status).toBe(400);
  });

  it("matches a dot in a route path literally", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/v1.0/status",
        method: "GET",
        status: 200,
        enabled: true,
        body: {},
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];

    expect(handleRouting({ path: "/v1.0/status", method: "GET" } as MockRequest, mockRoutes).status).toBe(200);
    expect(handleRouting({ path: "/v1x0/status", method: "GET" } as MockRequest, mockRoutes).status).toBe(404);
  });

  it("matches brackets in a route path literally", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/files/(draft)",
        method: "GET",
        status: 200,
        enabled: true,
        body: {},
        delay: 0,
        errorRate: 0,
        headers: {},
      },
    ];
    const req = { path: "/files/(draft)", method: "GET" } as MockRequest;

    const result = handleRouting(req, mockRoutes);
    expect(result.status).toBe(200);
  });

  it("answers each method from its own route on a shared path", () => {
    const mockRoutes: RouteConfig[] = [
      { path: "/users", method: "GET", status: 200, enabled: true, body: {}, delay: 0, errorRate: 0, headers: {} },
      { path: "/users", method: "POST", status: 201, enabled: true, body: {}, delay: 0, errorRate: 0, headers: {} },
    ];

    expect(handleRouting({ path: "/users", method: "GET" } as MockRequest, mockRoutes).status).toBe(200);
    expect(handleRouting({ path: "/users", method: "POST" } as MockRequest, mockRoutes).status).toBe(201);
    expect(handleRouting({ path: "/users", method: "DELETE" } as MockRequest, mockRoutes).status).toBe(404);
  });

  it("matches the method regardless of case", () => {
    const mockRoutes: RouteConfig[] = [{ path: "/users", method: "post", status: 201, enabled: true, body: {}, delay: 0, errorRate: 0, headers: {} }];
    const req = { path: "/users", method: "POST" } as MockRequest;

    const result = handleRouting(req, mockRoutes);
    expect(result.status).toBe(201);
  });

  it("treats a route with no method as GET", () => {
    const routeWithoutMethod = { path: "/health", status: 200, enabled: true, body: {}, delay: 0, errorRate: 0, headers: {} } as RouteConfig;

    expect(handleRouting({ path: "/health", method: "GET" } as MockRequest, [routeWithoutMethod]).status).toBe(200);
    expect(handleRouting({ path: "/health", method: "POST" } as MockRequest, [routeWithoutMethod]).status).toBe(404);
  });

  it("extracts chaos settings (delay/errorRate)", () => {
    const mockRoutes: RouteConfig[] = [
      {
        path: "/chaos",
        method: "GET",
        status: 200,
        delay: 500,
        errorRate: 0.5,
        enabled: true,
        body: {},
        headers: {},
      },
    ];
    const req = { path: "/chaos", method: "GET" } as MockRequest;

    const result = handleRouting(req, mockRoutes);
    expect(result.delay).toBe(500);
    expect(result.errorRate).toBe(0.5);
  });
});
