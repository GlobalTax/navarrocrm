
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

// Component to initialize performance monitoring
const PerformanceInitializer = () => {
  useGlobalMemoryTracker()
  useCriticalRoutePreloader()
  
  // Monitor performance budget with custom thresholds
  usePerformanceBudget({
    maxBundleSize: 1.5, // 1.5MB for CRM app
    maxLoadTime: 2500,  // 2.5s
    maxMemoryUsage: 75, // 75MB
    maxLCP: 2000,       // 2s
    maxFID: 100,        // 100ms
    maxCLS: 0.1         // 0.1 score
  })
  
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
