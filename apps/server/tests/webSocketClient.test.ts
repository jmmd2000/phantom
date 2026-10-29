import { describe, it, expect } from "vitest";
import type { Socket } from "node:net";
import { WebSocketClient } from "../src/webSocketClient.ts";

/**
 * A stand-in for a socket with a given number of bytes waiting to be sent.
 * A real socket on loopback needs several MB of unread data before the backlog shows, so it makes a slow test.
 */
function fakeSocket(writableLength: number) {
  return {
    writable: true,
    writableLength,
    written: [] as Buffer[],
    destroyed: false,
    write(frame: Buffer) {
      this.written.push(frame);
    },
    destroy() {
      this.destroyed = true;
    },
  };
}

describe("WebSocketClient.send", () => {
  it("writes the frame to a client that keeps up", () => {
    const socket = fakeSocket(0);
    new WebSocketClient(socket as unknown as Socket).send(Buffer.from("frame"));

    expect(socket.written).toHaveLength(1);
    expect(socket.destroyed).toBe(false);
  });

  it("drops a client with too much data waiting", () => {
    const socket = fakeSocket(5 * 1024 * 1024);
    new WebSocketClient(socket as unknown as Socket).send(Buffer.from("frame"));

    expect(socket.written).toHaveLength(0);
    expect(socket.destroyed).toBe(true);
  });
});
