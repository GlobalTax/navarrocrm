
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/contexts/AppContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Toaster } from '@/components/ui/sonner'

// Pages
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import Cases from '@/pages/Cases'
import TimeTracking from '@/pages/TimeTracking'
import Calendar from '@/pages/Calendar'
import Setup from '@/pages/Setup'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'
import AIAdmin from '@/pages/AIAdmin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Clients />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Cases />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/time-tracking"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TimeTracking />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Calendar />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
              
              <Route 
                path="/admin/ai-usage" 
                element={
                  <ProtectedRoute>
                    <AIAdmin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
