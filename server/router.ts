import type { MockRequest } from "./parser.ts";

export function handleRouting(request: MockRequest) {
  if (request.path === "/health") {
    return { status: 200, message: "OK", body: { response: "All good!" } };
  }

  if (request.path === "/api/info") {
    return {
      status: 200,
      message: "OK",
      body: {
        name: "Phantom",
        version: "0.0.0",
      },
    };
  }

  return {
    status: 404,
    message: "Not Found",
    body: { error: `Route ${request.path} not found` },
  };
}
