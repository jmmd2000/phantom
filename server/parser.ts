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

  return {
    method,
    path,
    version,
  };
}
