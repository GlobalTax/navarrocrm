import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'analyze' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // 'sunburst', 'treemap', 'network'
    })
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
          // Core vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Domain-specific chunks (matching route modules)
          'chunk-clients': [
            './src/pages/Contacts',
            './src/pages/ContactDetail', 
            './src/pages/Clients',
            './src/pages/ClientDetail'
          ],
          'chunk-cases': [
            './src/pages/Cases',
            './src/pages/CaseDetail',
            './src/pages/Tasks', 
            './src/pages/TaskDetail'
          ],
          'chunk-communications': [
            './src/pages/Emails',
            './src/pages/Calendar'
          ],
          'chunk-business': [
            './src/pages/Proposals',
            './src/pages/ProposalDetail',
            './src/pages/TimeTracking',
            './src/pages/Documents'
          ],
          'chunk-admin': [
            './src/pages/Users',
            './src/pages/Reports',
            './src/pages/SecurityAudit',
            './src/pages/Workflows'
          ],
          'chunk-integrations': [
            './src/pages/IntegrationSettings',
            './src/pages/QuantumPage',
            './src/pages/QuantumImport',
            './src/pages/QuantumBilling'
          ],
          'chunk-ai': [
            './src/pages/AdvancedAI',
            './src/pages/AIAdmin',
            './src/pages/IntelligentDashboard',
            './src/pages/Academia'
          ]
        }
      }
    }
  }
}));
