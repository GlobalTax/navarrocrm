import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// CLEAN BUILD - Final recovery
const CACHE_BUSTER = Date.now();

export default defineConfig(({ mode }) => ({
  // Force base path change to break all caches
  base: `./cache-break-${CACHE_BUSTER}/`,
  
  server: {
    host: "::",
    port: 8080,
  },
  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance to prevent hook conflicts
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  
  // Force rebuild of all dependencies
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true, // Force re-optimization
  },
  
  // Cache busting for build
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `emergency-[name]-${CACHE_BUSTER}.js`,
        chunkFileNames: `emergency-chunk-[name]-${CACHE_BUSTER}.js`,
        assetFileNames: `emergency-assets-[name]-${CACHE_BUSTER}.[ext]`,
      },
    },
  },
  
  // Clear all Vite caches
  cacheDir: `.vite-emergency-${CACHE_BUSTER}`,
}));