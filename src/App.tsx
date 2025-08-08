
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { OnboardingProvider } from '@/components/onboarding'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { AppRouter } from '@/router'
import { initializeRouteOptimization } from '@/utils/routeOptimizer'
import { useEffect } from 'react'

function App() {
  // Initialize route optimization on app load
  useEffect(() => {
    initializeRouteOptimization()
  }, [])

  return (
    <GlobalErrorBoundary>
      <QueryProvider>
        <AppProvider>
          <OnboardingProvider>
            <Toaster position="top-right" />
            <Router>
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
