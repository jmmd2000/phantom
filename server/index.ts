import * as net from "node:net";
import { styleText } from "node:util";
import crypto from "node:crypto";
import { isRequestComplete, isWebSocketUpgrade, parseRequest } from "./parser.ts";
import { sendCorsPreflightResponse, sendResponse } from "./responder.ts";
import { handleRouting } from "./router.ts";
import { watchConfig } from "./config.ts";
import { broadcast, encodeWsFrame, handleWebSocketHandshake, startHeartbeat } from "./ws.ts";

const PORT = 3001;
const server = net.createServer();

const socketManager = {
  active: new Set<net.Socket>(),
  add(socket: net.Socket) {
    this.active.add(socket);
    console.log(styleText("dim", `Client connected. Total active: ${this.active.size}`));
  },
  remove(socket: net.Socket) {
    this.active.delete(socket);
    console.log(styleText("dim", `Client disconnected. Total active: ${this.active.size}`));
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
  socket.on("data", (chunk: Buffer) => {
    // if its a websocket connection, ignore the http parser
    if (wsClients.has(socketID)) return;

    requestBuffer = Buffer.concat([requestBuffer, chunk]);
    console.log(styleText("blue", `[Parser] Received ${chunk.length} bytes. Total: ${requestBuffer.length}`));

    if (isRequestComplete(requestBuffer)) {
      const request = parseRequest(requestBuffer);

      if (request) {
        if (request.method === "OPTIONS") {
          console.log(styleText("dim", `[CORS] Preflight ${request.path}`));
          sendCorsPreflightResponse(socket);
          requestBuffer = Buffer.alloc(0);
          return;
        }

        if (isWebSocketUpgrade(request.headers)) {
          console.log(styleText(["magenta", "bold"], "[WebSocket] Handshake successful"));
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
        } else {
          const response = handleRouting(request);
          request.params = response.params;

          if (request.path === "/_admin/clear" && request.method === "POST") {
            requestHistory.length = 0;
            console.log(styleText("yellow", "[Admin] Request history cleared"));
          } else {
            const logEntry = {
              id: crypto.randomUUID(),
              method: request.method,
              path: request.path,
              status: response.status,
              timestamp: Date.now(),
            };

            requestHistory.push(logEntry);

            if (requestHistory.length > 100) requestHistory.shift();

            broadcast(wsClients, logEntry);
            console.log(styleText("magenta", `   ↳ broadcasted to ${wsClients.size} clients`));
          }

          const methodColor = request.method === "GET" ? "blue" : "green";
          console.log(styleText("bold", `\n[Router] `) + styleText(methodColor, request.method) + " " + styleText("white", request.path));

          if (Object.keys(request.params).length > 0) {
            console.log(styleText("dim", "  params:"), request.params);
          }

          const delay = response.delay ?? 0;

          if (delay > 0) {
            console.log(styleText("yellow", `   ↳ delaying response by ${delay}ms`));
          }

          setTimeout(() => {
            if (!socket.destroyed) {
              sendResponse(socket, response.status, response.message, response.body);
            }
          }, delay);
        }

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
    console.error(styleText("red", `Socket error: ${error.message}`));
    socketManager.remove(socket);
  });
});

watchConfig(() => {
  broadcast(wsClients, { type: "CONFIG_UPDATED" });
});
startHeartbeat(wsClients);

server.listen(PORT, () => {
  console.clear();

  const brand = styleText(["bgCyan", "black", "bold"], " PHANTOM ");
  const portLabel = styleText("cyan", "port");
  const envLabel = styleText("cyan", "env");
  const arrow = styleText("magenta", "→");

  console.log(`
  ${brand} ${styleText("dim", "v0.0.0")}

  ${portLabel}  ${styleText("bold", PORT.toString())}
  ${envLabel}  ${styleText("bold", "development")}

  ${arrow} ${styleText("bold", "ready")}
  `);
});

function shutdown() {
  console.log(styleText("yellow", "\nShutting down Phantom..."));

  server.close(() => {
    console.log(styleText("green", "Server stopped"));
    process.exit(0);
  });

  socketManager.destroyAll();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
