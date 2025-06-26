
import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppContext } from '@/contexts/AppContext'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { ErrorBoundary } from '@/components/errors'
import { MainLayout } from '@/components/layout/MainLayout'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import Cases from '@/pages/Cases'
import Tasks from '@/pages/Tasks'
import Proposals from '@/pages/Proposals'
import TimeTracking from '@/pages/TimeTracking'
import Invoicing from '@/pages/Invoicing'
import Settings from '@/pages/Settings'
import AIAdmin from '@/pages/AIAdmin'
import AdvancedAI from '@/pages/AdvancedAI'
import IntelligentDashboardPage from '@/pages/IntelligentDashboard'
import Workflows from '@/pages/Workflows'
import Contacts from '@/pages/Contacts'
import EnhancedAdvancedAI from '@/pages/EnhancedAdvancedAI'

function App() {
  const { session } = useContext(AppContext)

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Acceder a LegalFlow
                  </h2>
                  <Auth
                    supabaseClient={useContext(AppContext).supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']}
                    redirectTo={`${window.location.origin}/dashboard`}
                  />
                </div>
              </div>
            } />
            <Route path="/signup" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Crear Cuenta en LegalFlow
                  </h2>
                  <Auth
                    supabaseClient={useContext(AppContext).supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']}
                    redirectTo={`${window.location.origin}/dashboard`}
                  />
                </div>
              </div>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <MainLayout>
                  <Clients />
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
            <Route path="/cases" element={
              <ProtectedRoute>
                <MainLayout>
                  <Cases />
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
            <Route path="/proposals" element={
              <ProtectedRoute>
                <MainLayout>
                  <Proposals />
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
            <Route path="/invoicing" element={
              <ProtectedRoute>
                <MainLayout>
                  <Invoicing />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
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
            <Route path="/ai" element={
              <ProtectedRoute>
                <MainLayout>
                  <AdvancedAI />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/intelligent-dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <IntelligentDashboardPage />
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
            <Route path="/ai-enhanced" element={
              <ProtectedRoute>
                <MainLayout>
                  <EnhancedAdvancedAI />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  )
}

export default App
