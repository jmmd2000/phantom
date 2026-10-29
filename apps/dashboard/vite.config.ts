import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({
        pages: "build",
        assets: "build",
        fallback: "index.html",
        precompress: false,
        strict: true,
      }),
      paths: {
        base: "/_dashboard",
      },
    }),
  ],
  server: {
    // The dashboard calls the server it was loaded from. In development, forward those calls to Phantom on its default port.
    proxy: {
      "/_admin": "http://localhost:3001",
      "/_ws": { target: "ws://localhost:3001", ws: true },
    },
  },
});
