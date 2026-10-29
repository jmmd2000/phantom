import type { Socket } from "node:net";
import type { RequestLogEntry } from "@phantom/shared";
import { broadcast, encodeWsFrame } from "./ws.ts";

const HISTORY_LIMIT = 100;
const HEARTBEAT_INTERVAL = 30000;

/**
 * The live feed to the dashboard: the WebSocket subscribers, the recent request history and a heartbeat.
 * Call stop() to clear the heartbeat timer.
 */
export class Feed {
  private readonly subscribers = new Map<string, Socket>();
  private readonly history: RequestLogEntry[] = [];
  private readonly heartbeat: NodeJS.Timeout;

  constructor() {
    this.heartbeat = setInterval(() => {
      if (this.subscribers.size === 0) return;
      broadcast(this.subscribers, { type: "PING", timestamp: Date.now() });
    }, HEARTBEAT_INTERVAL);
  }

  hasSubscriber(id: string) {
    return this.subscribers.has(id);
  }

  /**
   * Adds a subscriber and sends it the request history.
   */
  subscribe(id: string, socket: Socket) {
    this.subscribers.set(id, socket);

    if (this.history.length > 0) {
      socket.write(encodeWsFrame(JSON.stringify({ type: "HISTORY", data: this.history })));
    }
  }

  unsubscribe(id: string) {
    this.subscribers.delete(id);
  }

  /**
   * Adds a request to the history and sends it to every subscriber.
   */
  record(entry: RequestLogEntry) {
    this.history.push(entry);
    if (this.history.length > HISTORY_LIMIT) this.history.shift();

    broadcast(this.subscribers, entry);
  }

  clearHistory() {
    this.history.length = 0;
  }

  notifyRoutesChanged() {
    broadcast(this.subscribers, { type: "CONFIG_UPDATED" });
  }

  stop() {
    clearInterval(this.heartbeat);
  }
}
