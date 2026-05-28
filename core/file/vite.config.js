import { defineConfig, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { hmr: { port: 99999999 }, port: 99999999, host: "127.0.0.1" },
  resolve: {
    alias: {
      "nystem-components": "/src/components",
      nystem: "/src/core/core/client/nystem.js",
      "my-moment": "/src/core/date/client/my-moment",
    },
  },
  build: { sourcemap: true },
});
