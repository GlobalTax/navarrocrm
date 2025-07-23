
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { OnboardingProvider } from '@/components/onboarding'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { AppRouter } from '@/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}

export default App
