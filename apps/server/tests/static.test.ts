import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { handleStaticFile } from "../src/static.ts";

describe("handleStaticFile", () => {
  let root: string;
  let dashboardFolder: string;

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "phantom-static-"));
    dashboardFolder = path.join(root, "dashboard");
    fs.mkdirSync(path.join(dashboardFolder, "_app"), { recursive: true });
    fs.writeFileSync(path.join(dashboardFolder, "index.html"), "dashboard page");
    fs.writeFileSync(path.join(dashboardFolder, "_app", "app.js"), "dashboard script");
    fs.writeFileSync(path.join(root, "secret.txt"), "secret");
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("serves a file from the dashboard folder", async () => {
    const file = await handleStaticFile("/_app/app.js", [dashboardFolder]);
    expect(file?.body.toString()).toBe("dashboard script");
  });

  it("falls back to the dashboard page for an unknown dashboard path", async () => {
    const file = await handleStaticFile("/_dashboard/settings", [dashboardFolder]);
    expect(file?.body.toString()).toBe("dashboard page");
  });

  it.each(["/_dashboard/../secret.txt", "/_app/../../secret.txt", "/_dashboard/%2e%2e/secret.txt", "/_dashboard/..%2fsecret.txt", "/_dashboard/%E0"])("refuses %s", async requestPath => {
    expect(await handleStaticFile(requestPath, [dashboardFolder])).toBeNull();
  });
});
