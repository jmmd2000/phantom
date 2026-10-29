import { describe, it, expect, afterEach } from "vitest";
import * as os from "node:os";
import { startServer, server } from "../index.ts";

const TEST_PORT = 3992;

/**
 * Returns this machine's first IPv4 address on a network interface, or undefined when it has none.
 */
function networkAddress(): string | undefined {
  return Object.values(os.networkInterfaces())
    .flat()
    .find(info => info?.family === "IPv4" && !info.internal)?.address;
}

/**
 * Returns true when the server at the URL answers at all, whatever the status.
 */
async function answers(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
}

function stopServer(): Promise<void> {
  return new Promise(resolve => server.close(() => resolve()));
}

const address = networkAddress();

describe.runIf(address)("Listening address", () => {
  afterEach(async () => {
    await stopServer();
  });

  it("only accepts connections from this machine by default", async () => {
    await startServer(TEST_PORT, false);

    expect(await answers(`http://127.0.0.1:${TEST_PORT}/anything`)).toBe(true);
    expect(await answers(`http://${address}:${TEST_PORT}/anything`)).toBe(false);
  });

  it("accepts connections on every interface with 0.0.0.0", async () => {
    await startServer(TEST_PORT, false, "0.0.0.0");

    expect(await answers(`http://${address}:${TEST_PORT}/anything`)).toBe(true);
  });
});
