import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRouteOptimization } from '@/utils/routeOptimizer'

// Initialize route optimization
initializeRouteOptimization()

createRoot(document.getElementById("root")!).render(<App />);
