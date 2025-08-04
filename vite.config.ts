import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Minimal Vite config to fix React corruption
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true, // Force re-optimization of dependencies
  },
  clearScreen: false,
  build: {
    rollupOptions: {
      external: [],
    },
  },
});