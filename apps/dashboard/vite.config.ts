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
    // Phantom refuses an admin call whose Origin and Host differ. The short form of a proxy entry rewrites the Host header, so the admin entry turns that off.
    proxy: {
      "/_admin": { target: "http://localhost:3001", changeOrigin: false },
      "/_ws": { target: "ws://localhost:3001", ws: true },
    },
  },
});
