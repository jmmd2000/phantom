import { describe, it, expect } from "vitest";
import { encodeWsFrame } from "../ws.ts";

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
