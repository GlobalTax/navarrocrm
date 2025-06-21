
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Cases from '@/pages/Cases';
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
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
                <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
                <Route path="/ai-admin" element={<ProtectedRoute><AIAdmin /></ProtectedRoute>} />
                
                {/* Fallback routes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              
              <Toaster position="bottom-right" />
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
