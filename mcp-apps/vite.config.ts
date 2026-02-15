import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [preact(), viteSingleFile(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: process.env.INPUT,
    },
  },
});
