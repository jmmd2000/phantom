import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { startTestServer, type TestServer } from "./helpers.ts";

describe("Bad requests", () => {
  let testServer: TestServer;
  let baseURL: string;
  let folder: string;

  beforeAll(async () => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "phantom-bad-requests-"));
    testServer = await startTestServer({ routesFilePath: path.join(folder, "routes.json") });
    testServer.routesFile.write([{ path: "/users/:id", method: "GET", status: 200, body: { ok: true }, enabled: true, delay: 0, errorRate: 0, headers: {} }]);
    testServer.routesFile.load();
    baseURL = testServer.baseURL;
  });

  afterAll(async () => {
    await testServer.stop();
    fs.rmSync(folder, { recursive: true, force: true });
  });

  it("answers 400 for invalid percent-encoding and keeps running", async () => {
    const badResponse = await fetch(`${baseURL}/users/%E0`);
    expect(badResponse.status).toBe(400);

    const goodResponse = await fetch(`${baseURL}/users/1`);
    expect(goodResponse.status).toBe(200);
  });
});
