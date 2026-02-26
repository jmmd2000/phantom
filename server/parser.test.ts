import { describe, it, expect } from "vitest";
import { isHeaderComplete } from "./parser.ts";

describe("isHeaderComplete", () => {
  it("S false for incomplete headers", () => {
    const buffer = Buffer.from("GET / HTTP/1.1\r\nHost: localhost");
    expect(isHeaderComplete(buffer)).toBe(false);
  });

  it("returns true for complete headers", () => {
    const buffer = Buffer.from("GET / HTTP/1.1\r\nHost: localhost\r\n\r\n");
    expect(isHeaderComplete(buffer)).toBe(true);
  });
});
