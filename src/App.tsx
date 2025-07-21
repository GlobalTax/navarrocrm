
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

// Lazy load new pages for sidebar navigation
const Cases = lazy(() => import('@/pages/Cases'))
const Proposals = lazy(() => import('@/pages/Proposals'))
const RecurringFees = lazy(() => import('@/pages/RecurringFees'))
const Tasks = lazy(() => import('@/pages/Tasks'))
const TimeTracking = lazy(() => import('@/pages/TimeTracking'))
const Calendar = lazy(() => import('@/pages/Calendar'))
const Rooms = lazy(() => import('@/pages/Rooms'))
const PanelOcupacion = lazy(() => import('@/pages/PanelOcupacion'))
const Equipment = lazy(() => import('@/pages/Equipment'))
const Documents = lazy(() => import('@/pages/Documents'))
const Users = lazy(() => import('@/pages/Users'))
const Integrations = lazy(() => import('@/pages/Integrations'))
const Reports = lazy(() => import('@/pages/Reports'))
const Academia = lazy(() => import('@/pages/Academia'))
const AcademiaAdmin = lazy(() => import('@/pages/AcademiaAdmin'))
const AIAssistant = lazy(() => import('@/pages/AIAssistant'))
const AIAdmin = lazy(() => import('@/pages/AIAdmin'))

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

                    {/* Principal */}
                    <Route 
                      path="/cases" 
                      element={
                        <LazyRouteWrapper routeName="Cases">
                          <Cases />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/proposals" 
                      element={
                        <LazyRouteWrapper routeName="Proposals">
                          <Proposals />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/recurring-fees" 
                      element={
                        <LazyRouteWrapper routeName="RecurringFees">
                          <RecurringFees />
                        </LazyRouteWrapper>
                      } 
                    />

                    {/* Productividad */}
                    <Route 
                      path="/tasks" 
                      element={
                        <LazyRouteWrapper routeName="Tasks">
                          <Tasks />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/time-tracking" 
                      element={
                        <LazyRouteWrapper routeName="TimeTracking">
                          <TimeTracking />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/calendar" 
                      element={
                        <LazyRouteWrapper routeName="Calendar">
                          <Calendar />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/rooms" 
                      element={
                        <LazyRouteWrapper routeName="Rooms">
                          <Rooms />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/panel-ocupacion" 
                      element={
                        <LazyRouteWrapper routeName="PanelOcupacion">
                          <PanelOcupacion />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/equipment" 
                      element={
                        <LazyRouteWrapper routeName="Equipment">
                          <Equipment />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/documents" 
                      element={
                        <LazyRouteWrapper routeName="Documents">
                          <Documents />
                        </LazyRouteWrapper>
                      } 
                    />

                    {/* Configuración */}
                    <Route 
                      path="/users" 
                      element={
                        <LazyRouteWrapper routeName="Users">
                          <Users />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/integrations" 
                      element={
                        <LazyRouteWrapper routeName="Integrations">
                          <Integrations />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/reports" 
                      element={
                        <LazyRouteWrapper routeName="Reports">
                          <Reports />
                        </LazyRouteWrapper>
                      } 
                    />

                    {/* IA & Academia */}
                    <Route 
                      path="/academia" 
                      element={
                        <LazyRouteWrapper routeName="Academia">
                          <Academia />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/academia/admin" 
                      element={
                        <LazyRouteWrapper routeName="AcademiaAdmin">
                          <AcademiaAdmin />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/ai-assistant" 
                      element={
                        <LazyRouteWrapper routeName="AIAssistant">
                          <AIAssistant />
                        </LazyRouteWrapper>
                      } 
                    />
                    <Route 
                      path="/ai-admin" 
                      element={
                        <LazyRouteWrapper routeName="AIAdmin">
                          <AIAdmin />
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
