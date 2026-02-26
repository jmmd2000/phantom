import * as net from "node:net";

const PORT = 3001;

const server = net.createServer((socket) => {
  console.log("Client connected from:", socket.remoteAddress);

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error.message);
  });
});

server.listen(PORT, () => {
  console.log(`\x1b[32m[Phantom]\x1b[0m Mock Server listening on port ${PORT}`);
});
