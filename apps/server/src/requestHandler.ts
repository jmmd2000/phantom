import type { Socket } from "node:net";
import crypto from "node:crypto";
import type { RequestLogEntry } from "@phantom/shared";
import { isRequestComplete, isWebSocketUpgrade, parseRequest } from "./parser.ts";
import { sendCorsPreflightResponse, sendResponse } from "./responder.ts";
import { handleRouting } from "./router.ts";
import { handleAdmin } from "./admin.ts";
import { handleWebSocketHandshake } from "./ws.ts";
import { handleStaticFile } from "./static.ts";
import { logger } from "./logger.ts";
import type { Feed } from "./feed.ts";
import type { RouteStore } from "./routeStore.ts";
import type { RoutesFile } from "./routesFile.ts";

const FEED_PATH = "/_ws";

/** What the request handler needs from the server. */
export interface RequestContext {
  feed: Feed;
  store: RouteStore;
  /** The routes file that admin changes are written to, or null when the routes live only in memory. */
  routesFile: RoutesFile | null;
  version: string;
  /** A delay in milliseconds for every request, or null to use each route's delay. */
  globalDelay: number | null;
  /** An error rate from 0 to 1 for every request, or null to use each route's error rate. */
  globalErrorRate: number | null;
}

/**
 * Handles the requests that arrive on one connection. An error while handling a request is logged
 * and answered with a 500, so it never stops the server.
 */
export function handleConnection(socket: Socket, context: RequestContext) {
  const { feed } = context;
  const socketID = `${socket.remoteAddress}:${socket.remotePort}`;
  let requestBuffer: Buffer = Buffer.alloc(0);
  let currentRequest = "";

  async function handleData(chunk: Buffer) {
    // if its a websocket connection, ignore the http parser
    if (feed.hasSubscriber(socketID)) return;

    requestBuffer = Buffer.concat([requestBuffer, chunk]);

    if (isRequestComplete(requestBuffer)) {
      const request = parseRequest(requestBuffer);

      if (request) {
        currentRequest = `${request.method} ${request.path}`;

        if (request.method === "OPTIONS") {
          logger.info(`CORS Preflight ${request.path}`);
          sendCorsPreflightResponse(socket);
          requestBuffer = Buffer.alloc(0);
          return;
        }

        if (isWebSocketUpgrade(request.headers)) {
          if (request.path.split("?")[0] !== FEED_PATH) {
            sendResponse(socket, 400, "Bad Request", { error: `WebSocket upgrades are only accepted on ${FEED_PATH}` });
            return;
          }

          if (!handleWebSocketHandshake(socket, request)) return;

          logger.info("WebSocket handshake successful");
          feed.subscribe(socketID, socket);
          return;
        }

        // handle dashboard static files immediately
        if (request.path.startsWith("/_dashboard") || request.path.startsWith("/_app") || request.path === "/phantom.svg") {
          const staticFile = await handleStaticFile(request.path);
          if (staticFile) {
            sendResponse(socket, 200, "OK", staticFile.body, staticFile.headers);
            requestBuffer = Buffer.alloc(0);
            return;
          }
        }

        // redirect root to dashboard if no root mock exists
        if (request.path === "/") {
          const rootResponse = handleRouting(request, context.store.getRoutes());
          if (rootResponse.status === 404) {
            sendResponse(socket, 302, "Found", "", { Location: "/_dashboard/" });
            requestBuffer = Buffer.alloc(0);
            return;
          }
        }

        const start = Date.now();
        const response = handleAdmin(request, context) ?? handleRouting(request, context.store.getRoutes());
        request.params = response.params;

        const isAdmin = request.path.startsWith("/_admin/");

        if (isAdmin && request.path === "/_admin/clear" && request.method === "POST") {
          feed.clearHistory();
          logger.admin("Request history cleared");
        }

        const delay = context.globalDelay ?? response.delay ?? 0;

        requestBuffer = Buffer.alloc(0);

        if (delay > 0) {
          logger.info(`Delaying response by ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (socket.destroyed) return;

        const errorRate = context.globalErrorRate ?? response.errorRate ?? 0;
        const shouldError = Math.random() < errorRate;

        if (!isAdmin) {
          const logEntry: RequestLogEntry = {
            id: crypto.randomUUID(),
            method: request.method,
            path: request.path,
            timestamp: start,
            headers: request.headers,
            body: request.body.toString("utf-8"),
            status: shouldError ? 500 : response.status,
            duration: Date.now() - start,
            responseBody: shouldError ? { error: "Artificial failure hit!" } : response.body,
          };

          feed.record(logEntry);

          logger.request(request.method, logEntry.status, request.path, logEntry.duration);
        }

        if (shouldError) {
          logger.error("Artificial failure hit!");
          sendResponse(socket, 500, "Internal Server Error", {
            error: "Artificial failure hit!",
          });
          return;
        }

        sendResponse(socket, response.status, response.message, response.body, response.headers);
      }
    }
  }

  socket.on("data", (chunk: Buffer) => {
    handleData(chunk).catch((error: unknown) => {
      requestBuffer = Buffer.alloc(0);
      logger.error(`Failed to handle ${currentRequest || "a request"}`, error);

      if (socket.writableEnded || socket.destroyed) return;
      sendResponse(socket, 500, "Internal Server Error", { error: "Internal server error" });
    });
  });

  socket.on("close", () => {
    feed.unsubscribe(socketID);
  });
}
