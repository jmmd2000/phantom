/**
 * Returns true when a request comes from a page that Phantom served, or from a client that sends no Origin, such as curl.
 * A browser sends an Origin on every cross-site request and WebSocket upgrade, so a page on another site always fails this check.
 */
export function isSameOrigin(headers: Record<string, string>): boolean {
  const origin = headers["origin"];
  if (origin === undefined) return true;

  const host = headers["host"];
  if (!host || !URL.canParse(origin)) return false;

  return new URL(origin).host === host.toLowerCase();
}
