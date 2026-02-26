/**
 * Checks if the full HTTP headers have been received.
 */
export function isHeaderComplete(buffer: Buffer): boolean {
  return buffer.includes("\r\n\r\n");
}
