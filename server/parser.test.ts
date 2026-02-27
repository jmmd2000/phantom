import { describe, it, expect } from "vitest";
import { isHeaderComplete, splitRequest } from "./parser.ts";

describe("isHeaderComplete", () => {
  it("returns false for incomplete headers", () => {
    const buffer = Buffer.from("GET / HTTP/1.1\r\nHost: localhost");
    expect(isHeaderComplete(buffer)).toBe(false);
  });

  it("returns true for complete headers", () => {
    const buffer = Buffer.from("GET / HTTP/1.1\r\nHost: localhost\r\n\r\n");
    expect(isHeaderComplete(buffer)).toBe(true);
  });
});

describe("splitRequest", () => {
  it("returns null when boundary is missing", () => {
    const buffer = Buffer.from("GET / HTTP/1.1");
    expect(splitRequest(buffer)).toBe(null);
  });

  it("splits headers and body correctly", () => {
    const buffer = Buffer.from("HEADERS\r\n\r\nBODY_CONTENT");
    const result = splitRequest(buffer);
    expect(result?.headers).toBe("HEADERS");
    expect(result?.body.toString()).toBe("BODY_CONTENT");
  });
});
