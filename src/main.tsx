import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRouteOptimization } from '@/utils/routeOptimizer'
import { preloadCriticalResources, registerServiceWorker } from '@/utils/bundleOptimizer'

// Initialize performance optimizations
initializeRouteOptimization()
preloadCriticalResources()

// Register service worker
registerServiceWorker().then(registered => {
  if (registered) {
    console.log('🚀 [Performance] Service Worker registered successfully')
  }
})

createRoot(document.getElementById("root")!).render(<App />);
