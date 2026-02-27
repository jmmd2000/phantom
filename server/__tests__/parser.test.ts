import { describe, it, expect } from "vitest";
import { isHeaderComplete, parseHeaders, parseRequest, parseRequestLine, splitRequest } from "../parser.ts";

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

describe("parseRequestLine", () => {
  it("returns structured data for a valid request line", () => {
    const line = "GET /api/test HTTP/1.1\r\nHost: localhost";
    const result = parseRequestLine(line);
    expect(result).toEqual({
      method: "GET",
      path: "/api/test",
      version: "HTTP/1.1",
    });
  });

  it("returns null for a malformed request line", () => {
    expect(parseRequestLine("NOT_VALID_HTTP")).toBe(null);
  });
});

describe("parseHeaders", () => {
  it("parses multiple headers into a record", () => {
    const raw = "GET / HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json";
    const result = parseHeaders(raw);
    expect(result).toEqual({
      host: "localhost",
      "content-type": "application/json",
    });
  });
});

describe("parseRequest", () => {
  it("returns a full MockRequest object for a valid stream", () => {
    const raw = Buffer.from("POST /api/users HTTP/1.1\r\n" + "Host: localhost\r\n" + "Content-Type: text/plain\r\n" + "\r\n" + "Hello World");

    const result = parseRequest(raw);

    expect(result).toMatchObject({
      method: "POST",
      path: "/api/users",
      version: "HTTP/1.1",
      headers: {
        host: "localhost",
        "content-type": "text/plain",
      },
    });

    expect(result?.body.toString()).toBe("Hello World");
  });

  it("handles complex headers and query parameters correctly", () => {
    const raw = Buffer.from(
      "GET /api/search?q=phantom&v=1 HTTP/1.1\r\n" +
        "Host: localhost:3001\r\n" +
        "User-Agent:  Mozilla/5.0  \r\n" + // Extra spaces
        "X-Custom-Data: value:with:colons\r\n" + // Colons in value
        "\r\n",
    );

    const result = parseRequest(raw);

    expect(result).toMatchObject({
      method: "GET",
      path: "/api/search?q=phantom&v=1",
      headers: {
        host: "localhost:3001",
        "user-agent": "Mozilla/5.0",
        "x-custom-data": "value:with:colons",
      },
    });
  });

  it("slices the body to exactly match Content-Length", () => {
    const raw = Buffer.from(
      "POST / HTTP/1.1\r\n" + "Content-Length: 5\r\n" + "\r\n" + "HELLO_EXTRA_DATA", // 5 bytes is "HELLO", the rest should be ignored
    );

    const result = parseRequest(raw);
    expect(result?.body.toString()).toBe("HELLO");
    expect(result?.body.length).toBe(5);
  });
});
