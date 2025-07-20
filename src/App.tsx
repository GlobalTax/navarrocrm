
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { OnboardingProvider } from '@/components/onboarding'
import { LazyRouteWrapper } from '@/components/optimization/LazyRouteWrapper'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

// Lazy load non-critical routes
const Contacts = lazy(() => import('@/pages/Contacts'))
const Setup = lazy(() => import('@/pages/Setup'))
const Emails = lazy(() => import('@/pages/Emails'))
const NylasCallback = lazy(() => import('@/pages/NylasCallback'))

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
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
            </div>
          </OnboardingProvider>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
