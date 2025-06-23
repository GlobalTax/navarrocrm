
import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from './contexts/AppContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Cases from './pages/Cases'
import Tasks from './pages/Tasks'
import Proposals from './pages/Proposals'
import Calendar from './pages/Calendar'
import TimeTracking from './pages/TimeTracking'
import IntegrationSettings from './pages/IntegrationSettings'
import AIAdmin from './pages/AIAdmin'
import AdvancedAI from './pages/AdvancedAI'
import Workflows from './pages/Workflows'
import IntelligentDashboard from './pages/IntelligentDashboard'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'
import Index from './pages/Index'
import { QueryClient } from './contexts/QueryContext'
import RecurrentFees from './pages/RecurrentFees'
import Academia from './pages/Academia'

function App() {
  return (
    <QueryClient>
      <AppProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: 'black',
                border: '1px solid #e5e7eb',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Redirección de dashboard legacy a la ruta principal */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            <Route
              path="/"
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
              path="/workflows"
              element={
                <ProtectedRoute allowedRoles={['partner', 'area_manager']}>
                  <MainLayout>
                    <Workflows />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/intelligent-dashboard"
              element={
                <ProtectedRoute allowedRoles={['partner', 'area_manager', 'senior']}>
                  <MainLayout>
                    <IntelligentDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/advanced-ai"
              element={
                <ProtectedRoute allowedRoles={['partner', 'area_manager', 'senior']}>
                  <MainLayout>
                    <AdvancedAI />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/academia"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Academia />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute allowedRoles={['partner', 'area_manager']}>
                  <MainLayout>
                    <IntegrationSettings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-admin"
              element={
                <ProtectedRoute allowedRoles={['partner']}>
                  <MainLayout>
                    <AIAdmin />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recurrent-fees"
              element={
                <ProtectedRoute allowedRoles={['partner', 'area_manager', 'senior']}>
                  <MainLayout>
                    <RecurrentFees />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AppProvider>
    </QueryClient>
  )
}

export default App
