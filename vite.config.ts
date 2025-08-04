import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// EMERGENCY CONFIG - Force complete cache clear
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true, // Force re-optimization of all dependencies
    include: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      // Force new chunk names to break cache
      output: {
        entryFileNames: `emergency-[name]-${Date.now()}.js`,
        chunkFileNames: `emergency-[name]-${Date.now()}.js`,
      }
    }
  },
  clearScreen: false,
  cacheDir: '.vite-emergency', // Use different cache directory
});