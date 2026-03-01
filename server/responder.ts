import { Socket } from "node:net";

/**
 * Sends a 204 No Content CORS preflight response.
 */
export function sendCorsPreflightResponse(socket: Socket) {
  const date = new Date().toUTCString();
  const response = [
    "HTTP/1.1 204 No Content",
    `Date: ${date}`,
    `Server: Phantom/0.0.0`,
    `Access-Control-Allow-Origin: *`,
    `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`,
    `Access-Control-Allow-Headers: Content-Type`,
    `Access-Control-Max-Age: 86400`,
    `Content-Length: 0`,
    `Connection: close`,
    "",
    "",
  ].join("\r\n");

  socket.write(response);
  socket.end();
}

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
