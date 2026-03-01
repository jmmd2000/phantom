import type { Socket } from "node:net";
import type { MockRequest } from "./parser.ts";
import { createHash } from "node:crypto";

export function handleWebSocketHandshake(socket: Socket, request: MockRequest) {
  const key = request.headers["sec-websocket-key"];

  if (!key) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
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
export function broadcast(clients: Map<string, Socket>, message: any) {
  const frame = encodeWsFrame(JSON.stringify(message));
  for (const socket of clients.values()) {
    socket.write(frame);
  }
}

/**
 * Starts a heartbeat interval to keep WebSocket connections alive.
 */
export function startHeartbeat(clients: Map<string, Socket>) {
  setInterval(() => {
    if (clients.size === 0) return;

    broadcast(clients, { type: "PING", timestamp: Date.now() });
  }, 30000);
}
