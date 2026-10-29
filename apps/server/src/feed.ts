import type { RequestLogEntry } from "@phantom/shared";
import type { WebSocketClient } from "./webSocketClient.ts";
import { encodeWsFrame } from "./ws.ts";

const HISTORY_LIMIT = 100;
const HEARTBEAT_INTERVAL = 30000;

/**
 * The live feed to the dashboard: the WebSocket subscribers, the recent request history and a heartbeat.
 * Call stop() to clear the heartbeat timer.
 */
export class Feed {
  private readonly subscribers = new Set<WebSocketClient>();
  private readonly history: RequestLogEntry[] = [];
  private readonly heartbeat: NodeJS.Timeout;

  constructor() {
    this.heartbeat = setInterval(() => {
      if (this.subscribers.size === 0) return;
      this.broadcast({ type: "PING", timestamp: Date.now() });
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Adds a subscriber and sends it the request history.
   */
  subscribe(client: WebSocketClient) {
    this.subscribers.add(client);

    if (this.history.length > 0) {
      client.send(encodeWsFrame(JSON.stringify({ type: "HISTORY", data: this.history })));
    }
  }

  unsubscribe(client: WebSocketClient) {
    this.subscribers.delete(client);
  }

  /**
   * Adds a request to the history and sends it to every subscriber.
   */
  record(entry: RequestLogEntry) {
    this.history.push(entry);
    if (this.history.length > HISTORY_LIMIT) this.history.shift();

    this.broadcast(entry);
  }

  clearHistory() {
    this.history.length = 0;
  }

  notifyRoutesChanged() {
    this.broadcast({ type: "CONFIG_UPDATED" });
  }

  stop() {
    clearInterval(this.heartbeat);
  }

  private broadcast(message: unknown) {
    const frame = encodeWsFrame(JSON.stringify(message));
    for (const client of this.subscribers) {
      client.send(frame);
    }
  }
}
