import { Socket } from "node:net";

/**
 * Sends a basic HTTP response to the client.
 */
export function sendResponse(socket: Socket, status: number, message: string, body: any) {
  const response = buildResponse(status, message, body);
  socket.write(response);
  socket.end();
}

/**
 * Builds a valid HTTP response string.
 */
export function buildResponse(status: number, message: string, body: any): string {
  const bodyString = typeof body === "object" ? JSON.stringify(body) : String(body);
  const bodyLength = Buffer.byteLength(bodyString, "utf-8");
  const date = new Date().toUTCString();

  return [
    `HTTP/1.1 ${status} ${message}`,
    `Date: ${date}`,
    `Server: Phantom/0.0.0`,
    `Content-Type: application/json`,
    `Content-Length: ${bodyLength}`,
    `Access-Control-Allow-Origin: *`,
    `Connection: close`,
    "", // Empty line boundary
    bodyString,
  ].join("\r\n");
}
