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

  return {
    method: requestLine.method || "UNKNOWN",
    path: requestLine.path,
    version: requestLine.version,
    headers,
    body: parts.body,
  };
}
