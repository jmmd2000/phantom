import { Socket } from "node:net";

export function sendResponse(socket: Socket, status: number, message: string, body: any) {
  const bodyString = typeof body === "object" ? JSON.stringify(body) : String(body);
  const bodyLength = Buffer.byteLength(bodyString, "utf-8");

  const response = [`HTTP/1.1 ${status} ${message}`, `Content-Type: application/json`, `Content-Length: ${bodyLength}`, `Access-Control-Allow-Origin: *`, `Connection: close`, "", bodyString].join("\r\n");

  socket.write(response);
  socket.end();
}
