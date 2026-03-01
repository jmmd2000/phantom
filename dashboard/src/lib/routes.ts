import { writable } from "svelte/store";

export const mockRoutes = writable<any[]>([]);

export async function fetchMockRoutes() {
  try {
    const res = await fetch("http://localhost:3001/_admin/routes");
    const data = await res.json();
    mockRoutes.set(data);
  } catch (error) {
    console.error("Failed to fetch routes", error);
  }
}
