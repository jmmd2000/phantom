const API_URL = "http://localhost:3001/_admin/routes";

export interface RouteConfig {
  path: string;
  method: string;
  status: number;
  body: any;
  enabled: boolean;
  delay: number;
  errorRate: number;
}

const routeDefaults = (route: Partial<RouteConfig>): RouteConfig => ({
  path: route.path ?? "/",
  method: route.method ?? "GET",
  status: route.status ?? 200,
  body: route.body ?? {},
  enabled: route.enabled ?? true,
  delay: route.delay ?? 0,
  errorRate: route.errorRate ?? 0,
});

const routeStore = $state<{ items: RouteConfig[] }>({ items: [] });

export const mockRoutes = {
  get items() {
    return routeStore.items;
  },
  set items(value: RouteConfig[]) {
    routeStore.items = value;
  },
};

export async function fetchMockRoutes() {
  try {
    const res = await fetch(API_URL);
    const data: Partial<RouteConfig>[] = await res.json();
    routeStore.items = data.map(routeDefaults);
  } catch (error) {
    console.error("Failed to fetch routes", error);
  }
}

export async function saveRoutes() {
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routeStore.items),
    });
  } catch (error) {
    console.error("Failed to save routes", error);
  }
}
