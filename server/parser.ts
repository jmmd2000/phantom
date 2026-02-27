/**
 * Checks if the full HTTP headers have been received.
 */
export function isHeaderComplete(buffer: Buffer): boolean {
  return buffer.includes("\r\n\r\n");
}

export function splitRequest(buffer: Buffer) {
  const boundaryIndex = buffer.indexOf("\r\n\r\n");
  if (boundaryIndex === -1) return null;

  const headers = buffer.subarray(0, boundaryIndex).toString("utf-8");
  const body = buffer.subarray(boundaryIndex + 4);

  return { headers, body };
}
