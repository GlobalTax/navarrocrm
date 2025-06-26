
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
    testTimeout: 15000,
    hookTimeout: 15000,
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
        '**/*.story.*',
        '**/types.ts',
        '**/index.ts'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        },
        // Thresholds específicos por módulo
        'src/hooks/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        'src/components/ui/**': {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        'src/services/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    // Configuración para tests en paralelo más eficiente
    maxConcurrency: 5,
    // Configuración de retry para tests flaky
    retry: process.env.CI ? 2 : 0,
    // Mejor reportes
    reporter: process.env.CI ? ['verbose', 'junit'] : ['verbose']
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
