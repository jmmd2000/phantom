import * as net from "node:net";
import { styleText } from "node:util";
import { isRequestComplete, parseRequest } from "./parser.ts";

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

server.on("connection", (socket) => {
  socketManager.add(socket);

  let requestBuffer: Buffer = Buffer.alloc(0);

  // listen to raw data
  socket.on("data", (chunk: Buffer) => {
    requestBuffer = Buffer.concat([requestBuffer, chunk]);
    console.log(styleText("blue", `[Parser] Received ${chunk.length} bytes. Total: ${requestBuffer.length}`));

    if (isRequestComplete(requestBuffer)) {
      const request = parseRequest(requestBuffer);

      if (request) {
        console.log(styleText("green", "[Parser] Request successfully parsed!"));
        console.log(request);

        // clear the buffer so it's ready for the next request
        requestBuffer = Buffer.alloc(0);
      }
    }
  });

  socket.on("close", () => {
    socketManager.remove(socket);
  });

  socket.on("error", (error) => {
    if ("code" in error && error.code === "ECONNRESET") return;
    console.error(styleText("red", `Socket error: ${error.message}`));
    socketManager.remove(socket);
  });
});

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
