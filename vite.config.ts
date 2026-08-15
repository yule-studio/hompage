import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 5273, not Vite's default — 5173 collides with other things running here,
  // and it's the origin comment-api/resume-api already allow first.
  server: { host: true, port: 5273, strictPort: true },
  preview: { host: true, port: 4173 },
  build: { sourcemap: true, outDir: "dist" },
});
