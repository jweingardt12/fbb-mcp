import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

function redirectRoot(): Plugin {
  return {
    name: "redirect-root",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/") {
          req.url = "/preview.html";
        }
        next();
      });
    },
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [redirectRoot(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "ui"),
    },
  },
  server: {
    host: true,
    open: "/preview.html",
    proxy: {
      "/api": {
        target: "http://localhost:8766",
        changeOrigin: true,
      },
    },
  },
});
