import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { startServer, server } from "../src/index.ts";
import { writeRoutes, reloadRoutes, setConfigPath } from "../src/config.ts";

describe("Bad requests", () => {
  const TEST_PORT = 3993;
  const baseURL = `http://localhost:${TEST_PORT}`;
  let folder: string;

  beforeAll(async () => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "phantom-bad-requests-"));
    setConfigPath(path.join(folder, "routes.json"));
    writeRoutes([{ path: "/users/:id", method: "GET", status: 200, body: { ok: true }, enabled: true, delay: 0, errorRate: 0, headers: {} }]);
    reloadRoutes();
    await startServer(TEST_PORT, false);
  });

  afterAll(() => {
    server.close();
    fs.rmSync(folder, { recursive: true, force: true });
    setConfigPath("routes.json");
  });

  it("answers 400 for invalid percent-encoding and keeps running", async () => {
    const badResponse = await fetch(`${baseURL}/users/%E0`);
    expect(badResponse.status).toBe(400);

    const goodResponse = await fetch(`${baseURL}/users/1`);
    expect(goodResponse.status).toBe(200);
  });
});
