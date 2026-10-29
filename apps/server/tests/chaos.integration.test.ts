import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { startTestServer, type TestServer } from "./helpers.ts";
import { writeRoutes, reloadRoutes, setConfigPath } from "../src/config.ts";

describe("Chaos Engine Integration", () => {
  let testServer: TestServer;
  let baseURL: string;
  const TEMP_CONFIG = path.join(__dirname, "routes.chaos.json");

  beforeAll(async () => {
    // Redirect config to a temp file
    setConfigPath(TEMP_CONFIG);
    testServer = await startTestServer();
    baseURL = testServer.baseURL;
  });

  afterAll(async () => {
    await testServer.stop();
    // Cleanup temp file
    if (fs.existsSync(TEMP_CONFIG)) {
      fs.unlinkSync(TEMP_CONFIG);
    }
    // Restore default
    setConfigPath("routes.json");
  });

  it("should respect the configured delay", async () => {
    const delay = 500;
    writeRoutes([
      {
        path: "/slow",
        method: "GET",
        status: 200,
        body: { ok: true },
        delay,
        errorRate: 0,
        enabled: true,
        headers: {},
      },
    ]);
    reloadRoutes();

    const start = Date.now();
    const res = await fetch(`${baseURL}/slow`);
    const end = Date.now();

    expect(res.status).toBe(200);
    expect(end - start).toBeGreaterThanOrEqual(delay);
  });

  it("should return 500 when errorRate is 1.0", async () => {
    writeRoutes([
      {
        path: "/fail",
        method: "GET",
        status: 200,
        body: { ok: true },
        delay: 0,
        errorRate: 1.0,
        enabled: true,
        headers: {},
      },
    ]);
    reloadRoutes();

    const res = await fetch(`${baseURL}/fail`);
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain("Artificial failure hit!");
  });

  it("should never fail when errorRate is 0.0", async () => {
    writeRoutes([
      {
        path: "/safe",
        method: "GET",
        status: 200,
        body: { ok: true },
        delay: 0,
        errorRate: 0,
        enabled: true,
        headers: {},
      },
    ]);
    reloadRoutes();

    const res = await fetch(`${baseURL}/safe`);
    expect(res.status).toBe(200);
  });
});
