import * as net from "node:net";
import { styleText } from "node:util";
import { isHeaderComplete } from "./parser.ts";

const PORT = 3001;
const server = net.createServer();

// track active sockets so they can be killed on shutdown
const activeSockets = new Set<net.Socket>();

server.on("connection", (socket) => {
  activeSockets.add(socket);
  console.log("Client connected. Total active:", activeSockets.size);

  let requestBuffer = Buffer.alloc(0);

  socket.on("data", (chunk: Buffer) => {
    requestBuffer = Buffer.concat([requestBuffer, chunk]);
    console.log(`\x1b[34m[Parser]\x1b[0m Received ${chunk.length} bytes. Total: ${requestBuffer.length}`);
    if (isHeaderComplete(requestBuffer)) {
      console.log("\x1b[34m[Parser]\x1b[0m Headers are complete. Ready to parse!");
      console.log(requestBuffer.toString("utf-8"));
    }
  });

  socket.on("close", () => {
    activeSockets.delete(socket);
    console.log("Client disconnected. Total active", activeSockets.size);
  });

  socket.on("error", (error) => {
    if ("code" in error && error.code === "ECONNRESET") return;
    console.error("Socket error:", error.message);
    activeSockets.delete(socket);
  });
});

server.listen(PORT, () => {
  console.clear();

  const name = styleText(["bgCyan", "black", "bold"], " PHANTOM ");
  const portLabel = styleText("cyan", "port");
  const envLabel = styleText("cyan", "env");
  const arrow = styleText("magenta", "→");

  console.log(`
     ${name} ${styleText("dim", "v0.0.0")}

     ${portLabel}  ${styleText("bold", PORT.toString())}
     ${envLabel}  ${styleText("bold", "development")}

     ${arrow} ${styleText("bold", "ready")}
     `);
});

function shutdown() {
  console.log("\nShutting down Phantom...");

  server.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });

  for (const socket of activeSockets) {
    socket.destroy();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
