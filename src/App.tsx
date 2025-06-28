
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'

// Import pages
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import Dashboard from '@/pages/Dashboard'
import Contacts from '@/pages/Contacts'
import ClientDetail from '@/pages/ClientDetail'
import Cases from '@/pages/Cases'
import CaseDetail from '@/pages/CaseDetail'
import Proposals from '@/pages/Proposals'
import Tasks from '@/pages/Tasks'
import TimeTracking from '@/pages/TimeTracking'
import Calendar from '@/pages/Calendar'
import Documents from '@/pages/Documents'
import Users from '@/pages/Users'
import Academia from '@/pages/Academia'
import AIAdmin from '@/pages/AIAdmin'
import Workflows from '@/pages/Workflows'
import RecurrentFees from '@/pages/RecurrentFees'
import AdvancedAI from '@/pages/AdvancedAI'
import IntegrationSettings from '@/pages/IntegrationSettings'
import Unauthorized from '@/pages/Unauthorized'
import IntelligentDashboard from '@/pages/IntelligentDashboard'
import NotFound from '@/pages/NotFound'
import Reports from '@/pages/Reports'
import SecurityAudit from '@/pages/SecurityAudit'

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
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            
            {/* Index route for initial redirection */}
            <Route path="/index" element={<Index />} />
            
            {/* Protected routes */}
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
            <Route path="/cases/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <CaseDetail />
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
            <Route path="/workflows" element={
              <ProtectedRoute>
                <MainLayout>
                  <Workflows />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/recurring-fees" element={
              <ProtectedRoute>
                <MainLayout>
                  <RecurrentFees />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/advanced-ai" element={
              <ProtectedRoute>
                <MainLayout>
                  <AdvancedAI />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/integration-settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <IntegrationSettings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <MainLayout>
                  <IntegrationSettings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/intelligent-dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <IntelligentDashboard />
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
            <Route path="/users" element={
              <ProtectedRoute>
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/security-audit" element={
              <ProtectedRoute>
                <MainLayout>
                  <SecurityAudit />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Special routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
