import { describe, it, expect } from "vitest";
import type { RequestLogEntry } from "@phantom/shared";
import { trimHistory } from "../src/feed.ts";

function entry(id: string, body = ""): RequestLogEntry {
  return { id, method: "GET", path: "/", timestamp: 0, headers: {}, body, status: 200, duration: 0, responseBody: {} };
}

function sizeOf(entries: RequestLogEntry[]) {
  return entries.reduce((total, item) => total + Buffer.byteLength(JSON.stringify(item)), 0);
}

describe("trimHistory", () => {
  it("keeps every entry when they fit", () => {
    const history = [entry("1"), entry("2")];
    expect(trimHistory(history, sizeOf(history))).toEqual(history);
  });

  it("drops the oldest entries first and keeps the order", () => {
    const history = [entry("1"), entry("2"), entry("3")];
    const newestTwo = history.slice(1);

    expect(trimHistory(history, sizeOf(newestTwo))).toEqual(newestTwo);
  });

  it("returns no entries when the newest one alone is too big", () => {
    const history = [entry("1"), entry("2", "x".repeat(1000))];
    expect(trimHistory(history, 500)).toEqual([]);
  });
});
