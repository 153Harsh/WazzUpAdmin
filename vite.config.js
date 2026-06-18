import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: true,
    port: 5600,
    proxy: {
      "/api": {
        target: "http://localhost:7821",
        changeOrigin: true,
      },
    },
  },
});
