import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { startTestServer, type TestServer } from "./helpers.ts";

const OTHER_ORIGIN = "http://evil.example";

describe("Request origins", () => {
  let testServer: TestServer;
  let folder: string;

  beforeAll(async () => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "phantom-origin-"));
    testServer = await startTestServer({ routesFilePath: path.join(folder, "routes.json") });
    testServer.routesFile.write([{ path: "/health", method: "GET", status: 200, body: { ok: true }, enabled: true, delay: 0, errorRate: 0, headers: {} }]);
  });

  afterAll(async () => {
    await testServer.stop();
    fs.rmSync(folder, { recursive: true, force: true });
  });

  it("refuses an admin change from another origin and keeps the routes", async () => {
    const response = await fetch(`${testServer.baseURL}/_admin/routes`, {
      method: "PUT",
      headers: { Origin: OTHER_ORIGIN, "Content-Type": "application/json" },
      body: "[]",
    });
    expect(response.status).toBe(403);

    const routes = await fetch(`${testServer.baseURL}/_admin/routes`).then(result => result.json());
    expect(routes).toHaveLength(1);
  });

  it("answers an admin request from the dashboard's own origin", async () => {
    const response = await fetch(`${testServer.baseURL}/_admin/version`, { headers: { Origin: testServer.baseURL } });
    expect(response.status).toBe(200);
  });

  it("answers a mock route from any origin", async () => {
    const response = await fetch(`${testServer.baseURL}/health`, { headers: { Origin: OTHER_ORIGIN } });
    expect(response.status).toBe(200);
  });
});
