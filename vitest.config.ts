
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/App.tsx',
        'supabase/',
        'public/',
        'dist/',
        'coverage/',
        '**/*.stories.*',
        '**/*.story.*'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/contexts": path.resolve(__dirname, "./src/contexts"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/lib"),
      "@/config": path.resolve(__dirname, "./src/config"),
      "@/integrations": path.resolve(__dirname, "./src/integrations"),
      "@/modules": path.resolve(__dirname, "./src/modules"),
      "@/tests": path.resolve(__dirname, "./src/tests"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
  }
})
