/**
 * Checks if the full HTTP headers have been received.
 */
export function isHeaderComplete(buffer: Buffer): boolean {
  return buffer.includes("\r\n\r\n");
}

/**
 * Splits a raw request buffer into its header string and body buffer.
 * Returns null if the boundary isn't found.
 */
export function splitRequest(buffer: Buffer) {
  const boundaryIndex = buffer.indexOf("\r\n\r\n");
  if (boundaryIndex === -1) return null;

  const headers = buffer.subarray(0, boundaryIndex).toString("utf-8");
  const body = buffer.subarray(boundaryIndex + 4);

  return { headers, body };
}

/**
 * Parses the first line of a HTTP request.
 */
export function parseRequestLine(headerString: string) {
  const first = headerString.split("\r\n")[0];
  if (!first) return null;

  const parts = first.split(" ");
  if (parts.length !== 3) return null;

  const [method, path, version] = parts;

  if (!method || !path || !version) {
    return null;
  }

  return {
    method: method.toUpperCase(),
    path,
    version,
  };
}

/**
 * Parses HTTP headers into a key-value Record.
 */
export function parseHeaders(headerString: string) {
  const headers: Record<string, string> = {};
  const lines = headerString.split("\r\n");

  // skip first line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (key) {
      headers[key] = value;
    }
  }
  return headers;
}

export interface MockRequest {
  method: string;
  path: string;
  version: string;
  headers: Record<string, string>;
  body: Buffer;
  params: Record<string, string>;
}

/**
 * Parses a raw TCP byte stream into a structured HTTP request object
 */
export function parseRequest(buffer: Buffer): MockRequest | null {
  const parts = splitRequest(buffer);
  if (!parts) return null;

  const requestLine = parseRequestLine(parts.headers);
  if (!requestLine) return null;

  const headers = parseHeaders(parts.headers);
  const transferEncoding = headers["transfer-encoding"]?.toLowerCase();

  let body = parts.body;

  if (transferEncoding === "chunked") {
    body = decodeChunkedBody(parts.body);
  } else if (headers["content-length"]) {
    const expectedLength = parseInt(headers["content-length"], 10);
    body = parts.body.subarray(0, expectedLength);
  }

  return {
    method: requestLine.method || "UNKNOWN",
    path: requestLine.path,
    version: requestLine.version,
    headers,
    body,
    params: {},
  };
}

/**
 * Determines if the entire HTTP request has been received.
 */
export function isRequestComplete(buffer: Buffer): boolean {
  if (!isHeaderComplete(buffer)) return false;

  const parts = splitRequest(buffer);
  if (!parts) return false;

  const headers = parseHeaders(parts.headers);
  const transferEncoding = headers["transfer-encoding"]?.toLowerCase();
  const contentLength = headers["content-length"];

  if (transferEncoding === "chunked") {
    // A chunked stream ends with "0\r\n\r\n"
    return parts.body.toString("utf-8").endsWith("0\r\n\r\n");
  }

  // if no content-length header, assume no body
  if (contentLength) {
    const expectedLength = parseInt(contentLength, 10);
    return parts.body.length >= expectedLength;
  }

  return true;
}

/**
 * Checks if the request headers indicate a WebSocket upgrade attempt.
 */
export function isWebSocketUpgrade(headers: Record<string, string>): boolean {
  const upgrade = headers["upgrade"]?.toLowerCase();
  const connection = headers["connection"]?.toLowerCase();

  return upgrade === "websocket" && connection?.includes("upgrade") === true;
}

function decodeChunkedBody(buffer: Buffer): Buffer {
  let offset = 0;
  const chunks: Buffer[] = [];

  while (offset < buffer.length) {
    const lineEnd = buffer.indexOf("\r\n", offset);
    if (lineEnd === -1) break;

    const sizeLine = buffer.subarray(offset, lineEnd).toString("utf-8");
    const sizeString = sizeLine.split(";")[0] || "";
    const size = parseInt(sizeString, 16);

    if (isNaN(size)) break;
    if (size === 0) break;

    // the actual data starts 2 bytes AFTER the size line (skipping the \r\n).
    const chunkStart = lineEnd + 2;
    const chunkEnd = chunkStart + size;

    chunks.push(buffer.subarray(chunkStart, chunkEnd));
    offset = chunkEnd + 2;
  }

  return Buffer.concat(chunks);
}
