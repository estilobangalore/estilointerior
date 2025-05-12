import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "./client",
  publicDir: "./client/public",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: true
  }
});
