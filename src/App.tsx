
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { QueryClient } from '@/contexts/QueryContext'
import { OnboardingProvider } from '@/components/onboarding'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { AppRouter } from '@/router'

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClient>
        <AppProvider>
          <OnboardingProvider>
            <Toaster position="top-right" />
            <Router>
              <div className="min-h-screen bg-gray-50">
                <AppRouter />
              </div>
            </Router>
          </OnboardingProvider>
        </AppProvider>
      </QueryClient>
    </GlobalErrorBoundary>
  )
}

export default App
