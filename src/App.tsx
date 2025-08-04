
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { OnboardingProvider } from '@/components/onboarding'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { AppRouter } from '@/router'
import { useGlobalMemoryTracker } from '@/hooks/performance/useMemoryTracker'
import { useCriticalRoutePreloader } from '@/hooks/performance/useRoutePreloader'
import { usePerformanceBudget } from '@/hooks/performance/usePerformanceBudget'

// Component to initialize performance monitoring (only in development)
const PerformanceInitializer = () => {
  useGlobalMemoryTracker()
  useCriticalRoutePreloader()
  
  // Only monitor performance budget in development to avoid loops
  if (import.meta.env.DEV) {
    usePerformanceBudget({
      maxBundleSize: 5,     // 5MB for dev build
      maxLoadTime: 15000,   // 15s for dev with HMR
      maxMemoryUsage: 500,  // 500MB for dev
      maxLCP: 5000,         // 5s for dev
      maxFID: 300,          // 300ms for dev
      maxCLS: 0.25          // 0.25 score for dev
    })
  }
  
  return null
}

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryProvider>
        <AppProvider>
          <OnboardingProvider>
            <Toaster position="top-right" />
            <Router>
              <PerformanceInitializer />
              <div className="min-h-screen bg-background text-foreground font-sans">
                <AppRouter />
              </div>
            </Router>
          </OnboardingProvider>
        </AppProvider>
      </QueryProvider>
    </GlobalErrorBoundary>
  )
}

export default App
