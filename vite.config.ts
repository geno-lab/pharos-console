import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH env lets the same build run either at / (dev) or /pharos/ (prod behind nginx).
// Set BASE_PATH=/pharos/ at build time for the mini_m2 deploy.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    base: env.BASE_PATH || "/",
    server: {
      port: 5173,
      proxy: {
        "/api": { target: "http://127.0.0.1:3000", changeOrigin: false },
        "/ws": { target: "ws://127.0.0.1:3000", ws: true },
      },
    },
  };
});
