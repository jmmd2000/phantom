/** A mock route, as stored in the routes file and edited in the dashboard. */
export interface RouteConfig {
  path: string;
  method: string;
  status: number;
  body: unknown;
  enabled: boolean;
  delay: number;
  errorRate: number;
  headers: Record<string, string>;
}

/** One request in the live feed and the request history. */
export interface RequestLogEntry {
  id: string;
  method: string;
  path: string;
  timestamp: number;
  headers: Record<string, string>;
  body: string;
  status: number;
  duration: number;
  responseBody: unknown;
}
