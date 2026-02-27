import { describe, it, expect } from "vitest";
import { buildResponse } from "../responder.ts";

describe("buildResponse", () => {
  it("returns a correctly formatted HTTP/1.1 string", () => {
    const output = buildResponse(200, "OK", { hello: "world" });

    // Check Status Line
    expect(output).toContain("HTTP/1.1 200 OK\r\n");

    // Check mandatory headers
    expect(output).toContain("Content-Type: application/json\r\n");
    expect(output).toContain("Content-Length: 17\r\n");

    // Check the boundary and body
    expect(output).toContain('\r\n\r\n{"hello":"world"}');
  });

  it("sets the Server header to Phantom", () => {
    const output = buildResponse(404, "Not Found", {});
    expect(output).toContain("Server: Phantom/0.0.0");
  });
});
