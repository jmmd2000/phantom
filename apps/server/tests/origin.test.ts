import { describe, it, expect } from "vitest";
import { isSameOrigin } from "../src/origin.ts";

describe("isSameOrigin", () => {
  it("allows a request with no Origin", () => {
    expect(isSameOrigin({ host: "localhost:3001" })).toBe(true);
  });

  it("allows an Origin that matches the Host", () => {
    expect(isSameOrigin({ host: "LocalHost:3001", origin: "http://localhost:3001" })).toBe(true);
  });

  it.each(["http://localhost:4000", "http://evil.example:3001", "null", "not a url"])("refuses %s", origin => {
    expect(isSameOrigin({ host: "localhost:3001", origin })).toBe(false);
  });

  it("refuses an Origin when there is no Host", () => {
    expect(isSameOrigin({ origin: "http://localhost:3001" })).toBe(false);
  });
});
