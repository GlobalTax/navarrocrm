
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { AppRouter } from '@/router'
import { SkipLink } from '@/components/accessibility/SkipLink'
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
            <SkipLink href="#main-content">
              Saltar al contenido principal
            </SkipLink>
            <Toaster 
              position="top-right"
              className="[&_[data-sonner-toast]]:bg-background [&_[data-sonner-toast]]:border-border"
            />
            <Router>
              <div className="min-h-screen bg-background text-foreground font-sans">
                <main id="main-content">
                  <AppRouter />
                </main>
              </div>
            </Router>
          </OnboardingProvider>
        </AppProvider>
      </QueryProvider>
    </GlobalErrorBoundary>
  )
}

export default App
