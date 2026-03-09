import { describe, it, expect } from "vitest";
import { handleRouting } from "../router.ts";
import type { MockRequest } from "../parser.ts";
import type { RouteConfig } from "../config.ts";

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
