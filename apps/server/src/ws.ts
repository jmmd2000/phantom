import type { Socket } from "node:net";
import { createHash } from "node:crypto";
import type { MockRequest } from "./parser.ts";
import { sendResponse } from "./responder.ts";

/**
 * Answers a WebSocket upgrade request. Sends a 101 and returns true when the request is valid.
 * Otherwise sends a 400 and returns false.
 */
export function handleWebSocketHandshake(socket: Socket, request: MockRequest): boolean {
  const key = request.headers["sec-websocket-key"];
  const version = request.headers["sec-websocket-version"];

  if (request.method !== "GET" || !key || version !== "13") {
    sendResponse(socket, 400, "Bad Request", { error: "Invalid WebSocket handshake" });
    return false;
  }

  const MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

  const acceptKey = createHash("sha1")
    .update(key + MAGIC_STRING)
    .digest("base64");

  const response = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "", // Empty line boundary
    "",
  ].join("\r\n");

  socket.write(response);
  return true;
}

/**
 * Wraps a string in a WebSocket text frame (RFC 6455).
 */
export function encodeWsFrame(dataString: string): Buffer {
  const payload = Buffer.from(dataString, "utf-8");
  const length = payload.length;

  let header: Buffer;

  if (length <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // 10000001
    header[1] = length;
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  return Buffer.concat([header, payload]);
}

/**
 * Broadcasts a message to all connected WebSocket clients.
 */
export function broadcast(clients: Map<string, Socket>, message: unknown) {
  const frame = encodeWsFrame(JSON.stringify(message));
  for (const socket of clients.values()) {
    socket.write(frame);
  }
}
