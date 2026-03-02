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
export function sendResponse(socket: Socket, status: number, message: string, body: any, headers: Record<string, string> = {}) {
  const response = buildResponse(status, message, body, headers);
  socket.write(response);
  socket.end();
}

/**
 * Builds a valid HTTP response as a Buffer.
 */
export function buildResponse(status: number, message: string, body: any, customHeaders: Record<string, string> = {}): Buffer {
  const isBuffer = Buffer.isBuffer(body);
  const bodyBuffer = isBuffer ? body : Buffer.from(typeof body === "object" ? JSON.stringify(body) : String(body));

  const bodyLength = bodyBuffer.length;
  const date = new Date().toUTCString();

  const lines = [`HTTP/1.1 ${status} ${message}`];

  lines.push(`Date: ${date}`);
  lines.push(`Server: Phantom/0.0.0`);
  lines.push(`Content-Length: ${bodyLength}`);
  lines.push(`Access-Control-Allow-Origin: *`);
  lines.push(`Connection: close`);

  Object.entries(customHeaders).forEach(([key, value]) => {
    lines.push(`${key}: ${value}`);
  });

  if (!customHeaders["Content-Type"] && !customHeaders["content-type"]) {
    lines.push(`Content-Type: ${isBuffer ? "application/octet-stream" : "application/json"}`);
  }

  const headerString = lines.join("\r\n") + "\r\n\r\n";
  return Buffer.concat([Buffer.from(headerString), bodyBuffer]);
}
