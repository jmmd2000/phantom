import { describe, it, expect } from "vitest";
import { handleRouting } from "../router.ts";
import type { MockRequest } from "../parser.ts";

describe("handleRouting engine", () => {
  it("matches a dynamic path and returns params", () => {
    const mockRoutes = [{ path: "/test/:id", status: 200, body: {} }];
    const req = { path: "/test/abc", method: "GET" } as MockRequest;

    const res = handleRouting(req, mockRoutes);

    expect(res.status).toBe(200);
    expect(res.params).toEqual({ id: "abc" });
  });

  it("handles non-matching paths correctly", () => {
    const mockRoutes = [{ path: "/only-one", status: 200, body: {} }];
    const req = { path: "/something-else", method: "GET" } as MockRequest;

    const res = handleRouting(req, mockRoutes);

    expect(res.status).toBe(404);
  });
});
