
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { OnboardingProvider } from '@/components/onboarding'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { BackgroundDataManager } from '@/components/cache/BackgroundDataManager'
import { AppRouter } from '@/router'

function App() {
  return (
    <GlobalErrorBoundary>
      <AppProvider>
        <QueryProvider>
          <OnboardingProvider>
            <BackgroundDataManager />
            <Toaster position="top-right" />
            <Router>
              <div className="min-h-screen bg-gray-50">
                <AppRouter />
              </div>
            </Router>
          </OnboardingProvider>
        </QueryProvider>
      </AppProvider>
    </GlobalErrorBoundary>
  )
}

export default App
