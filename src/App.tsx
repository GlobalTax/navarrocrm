
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/AppContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Cases from '@/pages/Cases';
import Tasks from '@/pages/Tasks';
import Proposals from '@/pages/Proposals';
import Calendar from '@/pages/Calendar';
import TimeTracking from '@/pages/TimeTracking';
import Setup from '@/pages/Setup';
import AIAdmin from '@/pages/AIAdmin';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes (reducido)
      retry: 1,
      refetchOnWindowFocus: false, // Evitar re-fetches innecesarios
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes - simplificadas */}
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
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Tasks />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/proposals" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Proposals />
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
                path="/ai-admin" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AIAdmin />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            
            <Toaster position="bottom-right" />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
