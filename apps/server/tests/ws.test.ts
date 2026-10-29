import { describe, it, expect } from "vitest";
import { decodeWsFrame, encodeWsFrame, OPCODE_CLOSE } from "../src/ws.ts";
import { clientFrame } from "./helpers.ts";

describe("encodeWsFrame", () => {
  it("returns a 2-byte header for small payloads", () => {
    const message = "Hello";
    const frame = encodeWsFrame(message);

    // byte 0: 0x81 (FIN + Text)
    expect(frame[0]).toBe(0x81);
    // byte 1: Length (5)
    expect(frame[1]).toBe(5);
    // byte 2+: "Hello"
    expect(frame.subarray(2).toString()).toBe("Hello");
  });

  it("returns a 4-byte header for medium payloads (126 marker)", () => {
    // 200 byte string
    const message = "A".repeat(200);
    const frame = encodeWsFrame(message);

    // byte 0: 0x81
    expect(frame[0]).toBe(0x81);
    // byte 1: 126
    expect(frame[1]).toBe(126);

    // bytes 2-3: 200
    const length = frame.readUInt16BE(2);
    expect(length).toBe(200);

    expect(frame.length).toBe(4 + 200); // 4 bytes header + 200 bytes payload
  });

  it("returns a 10-byte header for large payloads (127 marker)", () => {
    const hugeLength = 70000; // > 65535
    const message = "B".repeat(hugeLength);
    const frame = encodeWsFrame(message);

    expect(frame[0]).toBe(0x81);
    expect(frame[1]).toBe(127);

    // bytes 2-9: The 64 bit length
    const length = frame.readBigUInt64BE(2);
    expect(length).toBe(BigInt(hugeLength));
  });
});

describe("encodeWsFrame with an opcode", () => {
  it("sets the opcode in the first byte", () => {
    const frame = encodeWsFrame(Buffer.from([0x03, 0xe8]), OPCODE_CLOSE);
    expect(frame[0]).toBe(0x88);
  });
});

describe("decodeWsFrame", () => {
  it("unmasks the payload of a client frame", () => {
    const decoded = decodeWsFrame(clientFrame(Buffer.from("Hello")));

    expect(decoded?.isMasked).toBe(true);
    expect(decoded?.payload.toString()).toBe("Hello");
    expect(decoded?.frameLength).toBe(2 + 4 + 5);
  });

  it("reads a 16-bit payload length", () => {
    const payload = Buffer.from("A".repeat(200));
    const decoded = decodeWsFrame(clientFrame(payload));

    expect(decoded?.payload.equals(payload)).toBe(true);
  });

  it("returns null until the whole frame has arrived", () => {
    const frame = clientFrame(Buffer.from("A".repeat(200)));

    expect(decodeWsFrame(frame.subarray(0, 1))).toBeNull();
    expect(decodeWsFrame(frame.subarray(0, 3))).toBeNull();
    expect(decodeWsFrame(frame.subarray(0, frame.length - 1))).toBeNull();
  });

  it("reads only the first frame when two arrive together", () => {
    const first = clientFrame(Buffer.from("one"));
    const decoded = decodeWsFrame(Buffer.concat([first, clientFrame(Buffer.from("two"))]));

    expect(decoded?.payload.toString()).toBe("one");
    expect(decoded?.frameLength).toBe(first.length);
  });

  it("reports a frame that isn't masked", () => {
    const decoded = decodeWsFrame(encodeWsFrame("Hello"));

    expect(decoded?.isMasked).toBe(false);
    expect(decoded?.payload.toString()).toBe("Hello");
  });
});
