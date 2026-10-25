import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { uiRevision } from "./src/lib/site-info.ts";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [
    react(),
    {
      name: "local-source-verification",
      configureServer(server) {
        server.middlewares.use("/__hc/dev-info", (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(
            JSON.stringify({
              pid: process.pid,
              root: server.config.root,
              cwd: process.cwd(),
              mode: "vite-dev",
              uiRevision,
            }),
          );
        });
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:8788", changeOrigin: false } },
  },
  build: { chunkSizeWarningLimit: 300 },
});
