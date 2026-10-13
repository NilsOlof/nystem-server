import { defineConfig, transformWithOxc } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
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
