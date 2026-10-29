import { PhantomServer } from "../src/server.ts";

export interface TestServer {
  baseURL: string;
  port: number;
  stop: () => Promise<void>;
}

/**
 * Starts a Phantom server on a free port. It listens on 127.0.0.1 unless another host is given.
 */
export async function startTestServer(host = "127.0.0.1"): Promise<TestServer> {
  const phantom = new PhantomServer({ version: "test", globalDelay: null, globalErrorRate: null });
  const port = await phantom.start(0, host);
  return { baseURL: `http://127.0.0.1:${port}`, port, stop: () => phantom.stop() };
}
