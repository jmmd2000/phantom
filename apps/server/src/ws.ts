import type { Socket } from "node:net";
import { createHash } from "node:crypto";
import type { MockRequest } from "./parser.ts";
import { sendResponse } from "./responder.ts";

export const OPCODE_TEXT = 0x1;
export const OPCODE_CLOSE = 0x8;

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
 * Wraps a payload in a WebSocket frame (RFC 6455). Frames are text frames unless another opcode is given.
 */
export function encodeWsFrame(data: string | Buffer, opcode = OPCODE_TEXT): Buffer {
  const payload = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8");
  const length = payload.length;
  // The first bit marks the last frame of a message. Phantom never splits a message.
  const firstByte = 0x80 | opcode;

  let header: Buffer;

  if (length <= 125) {
    header = Buffer.alloc(2);
    header[0] = firstByte;
    header[1] = length;
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = firstByte;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = firstByte;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  return Buffer.concat([header, payload]);
}

export interface DecodedWsFrame {
  opcode: number;
  isMasked: boolean;
  payload: Buffer;
  /** The length of the whole frame in the buffer, header included. */
  frameLength: number;
}

/**
 * Reads the first frame in a buffer of bytes from a WebSocket client (RFC 6455), and unmasks its payload.
 * Returns null when the buffer doesn't hold a whole frame yet.
 */
export function decodeWsFrame(buffer: Buffer): DecodedWsFrame | null {
  if (buffer.length < 2) return null;

  const opcode = buffer.readUInt8(0) & 0x0f;
  const isMasked = (buffer.readUInt8(1) & 0x80) !== 0;
  let payloadLength = buffer.readUInt8(1) & 0x7f;
  let offset = 2;

  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  const maskLength = isMasked ? 4 : 0;
  const frameLength = offset + maskLength + payloadLength;
  if (buffer.length < frameLength) return null;

  const payload = Buffer.from(buffer.subarray(offset + maskLength, frameLength));

  if (isMasked) {
    const mask = buffer.subarray(offset, offset + 4);
    for (let i = 0; i < payload.length; i++) {
      payload.writeUInt8(payload.readUInt8(i) ^ mask.readUInt8(i % 4), i);
    }
  }

  return { opcode, isMasked, payload, frameLength };
}
