
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { OnboardingProvider } from '@/components/onboarding'
import { TelemetryProvider } from '@/components/monitoring/TelemetryProvider'
import { PerformanceAlert } from '@/components/monitoring/PerformanceAlert'
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import { LazyRouteWrapper } from '@/components/optimization/LazyRouteWrapper'
import { Toaster } from 'sonner'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

// Lazy load non-critical routes
const Contacts = lazy(() => import('@/pages/Contacts'))
const Setup = lazy(() => import('@/pages/Setup'))
const Emails = lazy(() => import('@/pages/Emails'))
const NylasCallback = lazy(() => import('@/pages/NylasCallback'))

// Create optimized query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500) {
          return error.status === 408 || error.status === 429 ? failureCount < 2 : false
        }
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 1
    }
  }
})

function App() {
  return (
    <GlobalErrorBoundary>
      <TelemetryProvider enableInProduction={false}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <Router>
              <OnboardingProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route 
                      path="/setup" 
                      element={
                        <LazyRouteWrapper routeName="Setup">
                          <Setup />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/contacts" 
                      element={
                        <LazyRouteWrapper routeName="Contacts">
                          <Contacts />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/emails/*" 
                      element={
                        <LazyRouteWrapper routeName="Emails">
                          <Emails />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/nylas/callback" 
                      element={
                        <LazyRouteWrapper routeName="NylasCallback">
                          <NylasCallback />
                        </LazyRouteWrapper>
                      } 
                    />
                  </Routes>
                  
                  {/* Performance monitoring alerts */}
                  <PerformanceAlert />
                  
                  {/* Toast notifications */}
                  <Toaster 
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                      duration: 4000,
                      className: 'border-0.5 border-black rounded-[10px]'
                    }}
                  />
                </div>
              </OnboardingProvider>
            </Router>
          </AppProvider>
        </QueryClientProvider>
      </TelemetryProvider>
    </GlobalErrorBoundary>
  )
}

export default App
