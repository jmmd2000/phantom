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
