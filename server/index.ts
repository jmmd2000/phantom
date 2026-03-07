#!/usr/bin/env node
import * as net from "node:net";
import { styleText } from "node:util";
import crypto from "node:crypto";
import { isRequestComplete, isWebSocketUpgrade, parseRequest } from "./parser.ts";
import { sendCorsPreflightResponse, sendResponse } from "./responder.ts";
import { handleRouting } from "./router.ts";
import { watchConfig, setConfigPath, reloadRoutes, writeRoutes } from "./config.ts";
import { broadcast, encodeWsFrame, handleWebSocketHandshake, startHeartbeat } from "./ws.ts";
import { parseCLI } from "./cli.ts";
import { handleStaticFile } from "./static.ts";
import { readFileSync } from "node:fs";
import { logger } from "./logger.ts";
import { hex, hexBg, COLOURS } from "./utils.ts";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));
export const VERSION = pkg.version;

const options = parseCLI(VERSION);

if (options.command === "init") {
  const defaultRoutes = [
    {
      path: "/health",
      method: "GET",
      status: 200,
      body: { status: "ok", service: "phantom" },
      enabled: true,
      delay: 0,
      errorRate: 0,
      headers: {},
    },
  ];

  writeRoutes(defaultRoutes);
  logger.success("Created default routes.json");
  logger.info("Run 'phantom' to start the server");
  process.exit(0);
}

setConfigPath(options.config);
reloadRoutes();

const PORT = options.port;
const server = net.createServer();

if (options.verbose) {
  logger.setLogLevel("verbose");
} else if (options.quiet) {
  logger.setLogLevel("quiet");
}

const socketManager = {
  active: new Set<net.Socket>(),
  add(socket: net.Socket) {
    this.active.add(socket);
    logger.info(`Client connected. Total active: ${this.active.size}`);
  },
  remove(socket: net.Socket) {
    this.active.delete(socket);
    logger.info(`Client disconnected. Total active: ${this.active.size}`);
  },
  destroyAll() {
    for (const socket of this.active) {
      socket.destroy();
    }
  },
};

export const wsClients = new Map<string, net.Socket>();
const requestHistory: any[] = [];

server.on("connection", (socket) => {
  socketManager.add(socket);

  const socketID = `${socket.remoteAddress}:${socket.remotePort}`;
  let requestBuffer: Buffer = Buffer.alloc(0);

  // listen to raw data
  socket.on("data", async (chunk: Buffer) => {
    // if its a websocket connection, ignore the http parser
    if (wsClients.has(socketID)) return;

    requestBuffer = Buffer.concat([requestBuffer, chunk]);

    if (isRequestComplete(requestBuffer)) {
      const request = parseRequest(requestBuffer);

      if (request) {
        if (request.method === "OPTIONS") {
          logger.info(`CORS Preflight ${request.path}`);
          sendCorsPreflightResponse(socket);
          requestBuffer = Buffer.alloc(0);
          return;
        }

        if (isWebSocketUpgrade(request.headers)) {
          logger.info("WebSocket Handshake successful");
          handleWebSocketHandshake(socket, request);
          wsClients.set(socketID, socket);

          if (requestHistory.length > 0) {
            socket.write(
              encodeWsFrame(
                JSON.stringify({
                  type: "HISTORY",
                  data: requestHistory,
                }),
              ),
            );
          }
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
          const rootResponse = handleRouting(request);
          if (rootResponse.status === 404) {
            sendResponse(socket, 302, "Found", "", { Location: "/_dashboard/" });
            requestBuffer = Buffer.alloc(0);
            return;
          }
        }

        const start = Date.now();
        const response = handleRouting(request);
        request.params = response.params;

        const isAdmin = request.path.startsWith("/_admin/");
        let logEntry: any = null;

        if (isAdmin && request.path === "/_admin/clear" && request.method === "POST") {
          requestHistory.length = 0;
          logger.admin("Request history cleared");
        }

        const delay = options.delay ?? response.delay ?? 0;

        if (delay > 0) {
          logger.info(`Delaying response by ${delay}ms`);
        }

        setTimeout(async () => {
          if (socket.destroyed) return;

          const errorRate = options.errorRate ?? response.errorRate ?? 0;
          const shouldError = Math.random() < errorRate;

          if (!isAdmin) {
            logEntry = {
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

            requestHistory.push(logEntry);
            if (requestHistory.length > 100) requestHistory.shift();

            broadcast(wsClients, logEntry);

            // log the request
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
        }, delay);

        requestBuffer = Buffer.alloc(0);
      }
    }
  });

  socket.on("close", () => {
    socketManager.remove(socket);
    wsClients.delete(socketID);
  });

  socket.on("error", (error) => {
    if ("code" in error && error.code === "ECONNRESET") return;
    logger.error(`Socket error: ${error.message}`);
    socketManager.remove(socket);
  });
});

watchConfig(() => {
  broadcast(wsClients, { type: "CONFIG_UPDATED" });
});

startHeartbeat(wsClients);

server.listen(PORT, () => {
  showBanner(PORT);
});

function showBanner(PORT: number) {
  console.clear();

  const art = [
    "      ████████      ",
    "    ████████████    ",
    "   ██████████████   ",
    "  ████████████████  ",
    "  ████  ████  ████  ",
    "  ████████████████  ",
    "  ████████████████  ",
    "  ████████████████  ",
    "  ████████████████  ",
    "  ██   ██  ██   ██  ",
  ];

  const brand = hexBg(COLOURS.PURPLE, "PHANTOM");
  const details = [
    `${brand}  ${styleText("white", `v${VERSION}`)}`,
    `port:      ${hex(COLOURS.PURPLE, PORT.toString())}`,
    `config:    ${hex(COLOURS.PURPLE, options.config)}`,
    `dashboard: ${hex(COLOURS.PURPLE, `http://localhost:${PORT}/_dashboard/`)}`,
    styleText("dim", "─".repeat(44)),
  ];

  console.log("");
  art.forEach((line, i) => {
    // start at line 3 of the ASCII art
    const info = details[i - 3] || "";
    console.log(`${hex(COLOURS.PURPLE, line)}  ${info}`);
  });
  console.log("");
}

function shutdown() {
  logger.info("Shutting down Phantom...");

  server.close(() => {
    logger.success("Server stopped");
    process.exit(0);
  });

  socketManager.destroyAll();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
