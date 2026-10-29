import * as net from "node:net";
import { DEFAULT_HOST } from "./cli.ts";
import { Feed } from "./feed.ts";
import { handleConnection, type RequestContext } from "./requestHandler.ts";
import { logger } from "./logger.ts";

export type ServerOptions = Omit<RequestContext, "feed">;

/**
 * The Phantom server. Nothing listens until start() is called, and stop() closes every connection.
 */
export class PhantomServer {
  readonly feed = new Feed();
  private readonly server = net.createServer();
  private readonly sockets = new Set<net.Socket>();

  constructor(options: ServerOptions) {
    const context: RequestContext = { ...options, feed: this.feed };

    this.server.on("connection", socket => {
      this.track(socket);
      handleConnection(socket, context);
    });
  }

  /**
   * Starts listening. Returns the port, which is useful when the port asked for is 0.
   */
  start(port: number, host = DEFAULT_HOST): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(port, host, () => {
        this.server.off("error", reject);
        const address = this.server.address();
        resolve(typeof address === "object" && address !== null ? address.port : port);
      });
    });
  }

  /**
   * Stops the heartbeat, closes every open connection and stops listening.
   */
  stop(): Promise<void> {
    this.feed.stop();
    for (const socket of this.sockets) {
      socket.destroy();
    }

    return new Promise(resolve => {
      this.server.close(() => resolve());
    });
  }

  private track(socket: net.Socket) {
    this.sockets.add(socket);
    logger.info(`Client connected. Total active: ${this.sockets.size}`);

    socket.on("close", () => {
      this.sockets.delete(socket);
      logger.info(`Client disconnected. Total active: ${this.sockets.size}`);
    });

    socket.on("error", error => {
      if ("code" in error && error.code === "ECONNRESET") return;
      logger.error(`Socket error: ${error.message}`);
    });
  }
}
