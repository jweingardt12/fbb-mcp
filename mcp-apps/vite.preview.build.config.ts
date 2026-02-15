import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/preview/",
  build: {
    outDir: "dist/preview",
    emptyOutDir: true,
    rollupOptions: {
      input: { index: "preview.html" },
    },
  },
});
