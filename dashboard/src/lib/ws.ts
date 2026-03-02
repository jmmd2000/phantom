import { writable } from "svelte/store";
import { fetchMockRoutes } from "./routes.svelte";

export const requestLog = writable<any[]>([]);
export const isConnected = writable(false);
export const isGlobalExpanded = writable(false);
export const activeMethodFilter = writable<string | null>(null);
export const activeStatusFilter = writable<string | null>(null);

let socket: WebSocket | null = null;

export function connectToServer() {
  if (socket) return;

  socket = new WebSocket("ws://localhost:3001");

  socket.onopen = () => {
    console.log("[Phantom] Connected to live stream");
    isConnected.set(true);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "PING") return;

      if (data.type === "HISTORY") {
        requestLog.set(data.data);
        return;
      }

      if (data.type === "CONFIG_UPDATED") {
        fetchMockRoutes();
        return;
      }

      requestLog.update((logs) => {
        const updated = [data, ...logs];

        return updated.slice(0, 1000);
      });
    } catch (err) {
      console.error("Failed to parse Websocket message:", err);
    }
  };

  socket.onclose = () => {
    console.log("[Phantom] Connection lost. Retrying in 3s...");
    isConnected.set(false);
    socket = null;
    setTimeout(connectToServer, 3000);
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
    isConnected.set(false);
    socket?.close();
  };
}
