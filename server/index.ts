import * as net from "node:net";
import { styleText } from "node:util";
import { isHeaderComplete, splitRequest } from "./parser.ts";

const PORT = 3001;
const server = net.createServer();

// track active sockets so they can be killed on shutdown
const activeSockets = new Set<net.Socket>();

server.on("connection", (socket) => {
  activeSockets.add(socket);
  console.log(styleText("dim", `Client connected. Total active: ${activeSockets.size}`));

  let requestBuffer: Buffer = Buffer.alloc(0);

  // listen to raw data
  socket.on("data", (chunk: Buffer) => {
    requestBuffer = Buffer.concat([requestBuffer, chunk]);
    console.log(styleText("blue", `[Parser] Received ${chunk.length} bytes. Total: ${requestBuffer.length}`));

    if (isHeaderComplete(requestBuffer)) {
      const parts = splitRequest(requestBuffer);

      if (parts) {
        console.log(styleText("green", "[Parser] Headers are complete. Ready to parse!"));
        console.log("\n" + styleText("bold", "--- HEADERS ---"));
        console.log(parts.headers); // Only show the headers string
        console.log(styleText("bold", "--- BODY ---"));
        console.log(parts.body.toString("utf-8") || "(empty)");
        console.log(styleText("bold", "--------------------") + "\n");
      }
    }
  });

  socket.on("close", () => {
    activeSockets.delete(socket);
    console.log(styleText("dim", `Client disconnected. Total active: ${activeSockets.size}`));
  });

  socket.on("error", (error) => {
    if ("code" in error && error.code === "ECONNRESET") return;
    console.error(styleText("red", `Socket error: ${error.message}`));
    activeSockets.delete(socket);
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

  for (const socket of activeSockets) {
    socket.destroy();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
