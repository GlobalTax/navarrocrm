
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-toast'
          ],
          
          // Data fetching
          'query-vendor': ['@tanstack/react-query'],
          
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Virtualization
          'virtualization': ['react-window', 'react-window-infinite-loader'],
          
          // Icons and utilities
          'utils-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          
          // Heavy components
          'heavy-components': [
            './src/components/migration/MigrationDashboard',
            './src/components/quantum/QuantumClientImporter',
            './src/components/onboarding/ImprovedClientOnboarding'
          ]
        }
      }
    },
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  // Enable experimental features
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ]
  }
}));
