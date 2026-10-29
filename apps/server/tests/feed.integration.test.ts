import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as net from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { encodeWsFrame, OPCODE_CLOSE } from "../src/ws.ts";
import { clientFrame, startTestServer, type TestServer } from "./helpers.ts";

const HANDSHAKE_HEADERS = {
  Upgrade: "websocket",
  Connection: "Upgrade",
  "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
  "Sec-WebSocket-Version": "13",
};

function upgradeRequest(requestPath: string, headers: Record<string, string>): string {
  const headerLines = Object.entries(headers).map(([name, value]) => `${name}: ${value}`);
  return [`GET ${requestPath} HTTP/1.1`, "Host: 127.0.0.1", ...headerLines, "", ""].join("\r\n");
}

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

    socket.write(upgradeRequest(requestPath, headers));
  });
}

/**
 * Resolves with every byte the server sends, once the server ends the connection.
 */
function readUntilEnd(socket: net.Socket): Promise<Buffer> {
  return new Promise(resolve => {
    const chunks: Buffer[] = [];
    socket.on("data", (chunk: Buffer) => chunks.push(chunk));
    socket.on("end", () => resolve(Buffer.concat(chunks)));
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

  it("answers a close frame and ends the connection", async () => {
    const socket = net.connect(testServer.port, "127.0.0.1");
    const received = readUntilEnd(socket);
    const normalClosure = Buffer.from([0x03, 0xe8]);

    // Send the close frame in the same write as the handshake, as a client may.
    socket.write(Buffer.concat([Buffer.from(upgradeRequest("/_ws", HANDSHAKE_HEADERS)), clientFrame(normalClosure, OPCODE_CLOSE)]));

    const closeReply = encodeWsFrame(normalClosure, OPCODE_CLOSE);
    expect((await received).subarray(-closeReply.length)).toEqual(closeReply);
  });

  it("refuses a dashboard once 10 are connected", async () => {
    // A separate server, so sockets from the other tests can't fill it first.
    const fullServer = await startTestServer({ routesFilePath: path.join(folder, "full-routes.json") });
    const sockets: net.Socket[] = [];

    for (let i = 0; i < 10; i++) {
      const { socket, response } = await sendUpgrade(fullServer.port, "/_ws", HANDSHAKE_HEADERS);
      expect(response).toMatch(/^HTTP\/1\.1 101/);
      sockets.push(socket);
    }

    const { socket: extraSocket, response } = await sendUpgrade(fullServer.port, "/_ws", HANDSHAKE_HEADERS);
    expect(response).toMatch(/^HTTP\/1\.1 503/);

    for (const socket of [...sockets, extraSocket]) {
      socket.destroy();
    }
    await fullServer.stop();
  });
});
