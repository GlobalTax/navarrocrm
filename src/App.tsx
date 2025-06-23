
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'

// Import pages
import Dashboard from '@/pages/Dashboard'
import Contacts from '@/pages/Contacts'
import ClientDetail from '@/pages/ClientDetail'
import Cases from '@/pages/Cases'
import Proposals from '@/pages/Proposals'
import Tasks from '@/pages/Tasks'
import TimeTracking from '@/pages/TimeTracking'
import Calendar from '@/pages/Calendar'
import Documents from '@/pages/Documents'
import Academia from '@/pages/Academia'
import AIAdmin from '@/pages/AIAdmin'

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
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <MainLayout>
                  <Contacts />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/contacts/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientDetail />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/cases" element={
              <ProtectedRoute>
                <MainLayout>
                  <Cases />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/proposals" element={
              <ProtectedRoute>
                <MainLayout>
                  <Proposals />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <MainLayout>
                  <Tasks />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/time-tracking" element={
              <ProtectedRoute>
                <MainLayout>
                  <TimeTracking />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <MainLayout>
                  <Calendar />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <MainLayout>
                  <Documents />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/academia" element={
              <ProtectedRoute>
                <MainLayout>
                  <Academia />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-admin" element={
              <ProtectedRoute>
                <MainLayout>
                  <AIAdmin />
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
