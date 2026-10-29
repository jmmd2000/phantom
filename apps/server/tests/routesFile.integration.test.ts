import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const TEST_PORT = 3998;
const baseURL = `http://localhost:${TEST_PORT}`;
const serverEntry = path.resolve(import.meta.dirname, "../src/index.ts");

/**
 * Checks the condition every 50ms until it is true. Throws if it is still false after the timeout.
 */
async function waitFor(condition: () => Promise<boolean>, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error("Timed out waiting for the server");
}

/**
 * Returns the status of a GET request, or 0 when the server doesn't answer.
 */
async function statusOf(requestPath: string): Promise<number> {
  try {
    const response = await fetch(`${baseURL}${requestPath}`);
    return response.status;
  } catch {
    return 0;
  }
}

describe("Routes file", () => {
  let folder: string;
  let serverProcess: ChildProcess;
  let output = "";

  beforeAll(async () => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "phantom-"));
    serverProcess = spawn(process.execPath, [serverEntry, "--port", String(TEST_PORT)], { cwd: folder });
    serverProcess.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    await waitFor(async () => (await statusOf("/hello")) !== 0);
  });

  afterAll(() => {
    serverProcess.kill();
    fs.rmSync(folder, { recursive: true, force: true });
  });

  it("starts with no routes when the folder has no routes file", async () => {
    expect(await statusOf("/hello")).toBe(404);
    expect(output.split("phantom init").length - 1).toBe(1);
  });

  it("loads the routes when the file is created", async () => {
    const routes = [{ path: "/hello", method: "GET", status: 200, body: { ok: true }, enabled: true, delay: 0, errorRate: 0, headers: {} }];
    fs.writeFileSync(path.join(folder, "routes.json"), JSON.stringify(routes));

    await waitFor(async () => (await statusOf("/hello")) === 200);
    expect(await statusOf("/hello")).toBe(200);
  });

  it("keeps the last routes when the file is deleted", async () => {
    fs.rmSync(path.join(folder, "routes.json"));
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(await statusOf("/hello")).toBe(200);
  });
});
