import { PhantomServer } from "../src/server.ts";
import { RouteStore } from "../src/routeStore.ts";
import { RoutesFile } from "../src/routesFile.ts";

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
