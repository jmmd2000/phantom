import type { Socket } from "node:net";
import { decodeWsFrame, encodeWsFrame, OPCODE_CLOSE } from "./ws.ts";
import { logger } from "./logger.ts";

const MAX_INCOMING_BYTES = 64 * 1024;
const MAX_BACKLOG_BYTES = 4 * 1024 * 1024;

/**
 * One WebSocket connection after the handshake. It sends frames to the client and reads the frames the client sends.
 * The dashboard only sends a close frame, so the client ignores every other frame.
 */
export class WebSocketClient {
  private readonly socket: Socket;
  private incoming: Buffer = Buffer.alloc(0);

  constructor(socket: Socket) {
    this.socket = socket;
  }

  /**
   * Sends a frame. Destroys the connection instead when too many bytes are still waiting to reach the client.
   */
  send(frame: Buffer) {
    if (!this.socket.writable) return;

    // writableLength counts the bytes the socket hasn't sent yet. They build up when a client stops reading.
    if (this.socket.writableLength > MAX_BACKLOG_BYTES) {
      logger.warn("Dropped a dashboard that fell behind the live feed");
      this.socket.destroy();
      return;
    }

    this.socket.write(frame);
  }

  /**
   * Reads bytes from the client. Answers a close frame and ends the connection.
   * Destroys the connection when a frame isn't masked, or when too many bytes wait for the rest of a frame.
   */
  receive(chunk: Buffer) {
    this.incoming = Buffer.concat([this.incoming, chunk]);

    if (this.incoming.length > MAX_INCOMING_BYTES) {
      this.socket.destroy();
      return;
    }

    let frame = decodeWsFrame(this.incoming);

    while (frame) {
      // The RFC requires every frame from a client to be masked.
      if (!frame.isMasked) {
        this.socket.destroy();
        return;
      }

      this.incoming = this.incoming.subarray(frame.frameLength);

      if (frame.opcode === OPCODE_CLOSE) {
        this.answerClose(frame.payload);
        return;
      }

      frame = decodeWsFrame(this.incoming);
    }
  }

  /**
   * Sends a close frame back with the client's status code, then ends the connection.
   */
  private answerClose(payload: Buffer) {
    // The status code is the first two bytes of a close payload. The rest is an optional reason.
    const statusCode = payload.subarray(0, 2);
    this.socket.end(encodeWsFrame(statusCode, OPCODE_CLOSE));
  }
}
