import { PhantomServer } from "../src/server.ts";
import { RouteStore } from "../src/routeStore.ts";
import { RoutesFile } from "../src/routesFile.ts";
import { encodeWsFrame } from "../src/ws.ts";

export interface TestServer {
  baseURL: string;
  port: number;
  routesFile: RoutesFile;
  stop: () => Promise<void>;
}

interface TestServerOptions {
  host?: string;
  routesFilePath: string;
}

/**
 * Starts a Phantom server on a free port, with its routes in the given file. It listens on 127.0.0.1 unless another host is given.
 */
export async function startTestServer({ host = "127.0.0.1", routesFilePath }: TestServerOptions): Promise<TestServer> {
  const store = new RouteStore();
  const routesFile = new RoutesFile(routesFilePath, store);
  const phantom = new PhantomServer({ version: "test", globalDelay: null, globalErrorRate: null, store, routesFile });
  const port = await phantom.start(0, host);
  return { baseURL: `http://127.0.0.1:${port}`, port, routesFile, stop: () => phantom.stop() };
}

/**
 * Builds a frame as a browser sends it, with the payload masked.
 */
export function clientFrame(payload: Buffer, opcode?: number): Buffer {
  const serverFrame = encodeWsFrame(payload, opcode);
  const header = Buffer.from(serverFrame.subarray(0, serverFrame.length - payload.length));
  // Set the mask bit, which is the first bit of the second byte.
  header.writeUInt8(header.readUInt8(1) | 0x80, 1);

  const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
  const maskedPayload = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) {
    maskedPayload.writeUInt8(payload.readUInt8(i) ^ mask.readUInt8(i % 4), i);
  }

  return Buffer.concat([header, mask, maskedPayload]);
}
