import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as net from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { startTestServer, type TestServer } from "./helpers.ts";

const HANDSHAKE_HEADERS = {
  Upgrade: "websocket",
  Connection: "Upgrade",
  "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
  "Sec-WebSocket-Version": "13",
};

/**
 * Sends an upgrade request on a raw socket. Resolves with the socket and the response headers.
 */
function sendUpgrade(port: number, requestPath: string, headers: Record<string, string>): Promise<{ socket: net.Socket; response: string }> {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, "127.0.0.1");
    let received = "";

    socket.on("error", reject);
    socket.on("data", function onData(chunk: Buffer) {
      received += chunk.toString("utf-8");
      const headerEnd = received.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;

      socket.off("data", onData);
      resolve({ socket, response: received.slice(0, headerEnd) });
    });

    const headerLines = Object.entries(headers).map(([name, value]) => `${name}: ${value}`);
    socket.write([`GET ${requestPath} HTTP/1.1`, "Host: 127.0.0.1", ...headerLines, "", ""].join("\r\n"));
  });
}

function nextData(socket: net.Socket): Promise<Buffer> {
  return new Promise(resolve => {
    socket.once("data", resolve);
  });
}

describe("Live feed", () => {
  let testServer: TestServer;
  let folder: string;

  beforeAll(async () => {
    folder = fs.mkdtempSync(path.join(os.tmpdir(), "phantom-feed-"));
    testServer = await startTestServer({ routesFilePath: path.join(folder, "routes.json") });
    testServer.routesFile.write([{ path: "/health", method: "GET", status: 200, body: { ok: true }, enabled: true, delay: 0, errorRate: 0, headers: {} }]);
  });

  afterAll(async () => {
    await testServer.stop();
    fs.rmSync(folder, { recursive: true, force: true });
  });

  it("accepts an upgrade on /_ws and sends it each request", async () => {
    const { socket, response } = await sendUpgrade(testServer.port, "/_ws?client=test", HANDSHAKE_HEADERS);
    expect(response).toMatch(/^HTTP\/1\.1 101/);

    const frame = nextData(socket);
    await fetch(`${testServer.baseURL}/health`);
    expect((await frame).toString("utf-8")).toContain('"path":"/health"');

    socket.destroy();
  });

  it("refuses an upgrade on any other path", async () => {
    const { socket, response } = await sendUpgrade(testServer.port, "/health", HANDSHAKE_HEADERS);
    expect(response).toMatch(/^HTTP\/1\.1 400/);
    socket.destroy();
  });

  it("refuses a handshake without a key", async () => {
    const headersWithoutKey = { Upgrade: "websocket", Connection: "Upgrade", "Sec-WebSocket-Version": "13" };
    const { socket, response } = await sendUpgrade(testServer.port, "/_ws", headersWithoutKey);
    expect(response).toMatch(/^HTTP\/1\.1 400/);
    socket.destroy();
  });
});
