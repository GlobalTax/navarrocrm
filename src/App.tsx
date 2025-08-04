
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { OnboardingProvider } from '@/components/onboarding'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { AppRouter } from '@/router'
import { useGlobalMemoryTracker } from '@/hooks/performance/useMemoryTracker'
import { useCriticalRoutePreloader } from '@/hooks/performance/useRoutePreloader'

// Component to initialize performance monitoring
const PerformanceInitializer = () => {
  useGlobalMemoryTracker()
  useCriticalRoutePreloader()
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
