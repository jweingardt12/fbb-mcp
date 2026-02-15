import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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

export default defineConfig({
  plugins: [redirectRoot(), react(), tailwindcss()],
  server: {
    open: "/preview.html",
  },
});
