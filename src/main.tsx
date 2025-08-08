import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRouteOptimization } from '@/utils/routeOptimizer'
import * as Sentry from '@sentry/react'

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
  replaysSessionSampleRate: import.meta.env.DEV ? 0.1 : 0.0,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
})

// Initialize route optimization
initializeRouteOptimization()

createRoot(document.getElementById("root")!).render(<App />);
