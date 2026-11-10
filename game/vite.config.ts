import { defineConfig } from "vite";

// Relative base so the build runs from any static host path (Vinssi Pages).
export default defineConfig({
  base: "./",
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
  server: { port: 5183, strictPort: true },
});
