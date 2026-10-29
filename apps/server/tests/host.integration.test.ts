import { describe, it, expect, afterEach } from "vitest";
import * as os from "node:os";
import { PhantomServer } from "../src/server.ts";

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

const address = networkAddress();

describe.runIf(address)("Listening address", () => {
  let phantom: PhantomServer;

  afterEach(async () => {
    await phantom.stop();
  });

  it("only accepts connections from this machine by default", async () => {
    phantom = new PhantomServer({ version: "test", globalDelay: null, globalErrorRate: null });
    const port = await phantom.start(0);

    expect(await answers(`http://127.0.0.1:${port}/anything`)).toBe(true);
    expect(await answers(`http://${address}:${port}/anything`)).toBe(false);
  });

  it("accepts connections on every interface with 0.0.0.0", async () => {
    phantom = new PhantomServer({ version: "test", globalDelay: null, globalErrorRate: null });
    const port = await phantom.start(0, "0.0.0.0");

    expect(await answers(`http://${address}:${port}/anything`)).toBe(true);
  });
});
