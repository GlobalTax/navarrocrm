
import React from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'

import { QueryClient } from '@/contexts/QueryContext'
import { AppProvider } from '@/contexts/AppContext'
import { GlobalStateProvider } from '@/contexts/GlobalStateContext'
import { AdvancedAnalyticsProvider } from '@/components/analytics/AdvancedAnalyticsProvider'

import { MainLayout } from '@/components/layout/MainLayout'

import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import Unauthorized from '@/pages/Unauthorized'
import NotFound from '@/pages/NotFound'

import Dashboard from '@/pages/Dashboard'
import Contacts from '@/pages/Contacts'
import ContactDetail from '@/pages/ContactDetail'
import Clients from '@/pages/Clients'
import ClientDetail from '@/pages/ClientDetail'
import Cases from '@/pages/Cases'
import Proposals from '@/pages/Proposals'
import Tasks from '@/pages/Tasks'
import TimeTracking from '@/pages/TimeTracking'
import Calendar from '@/pages/Calendar'
import Documents from '@/pages/Documents'
import Users from '@/pages/Users'
import Reports from '@/pages/Reports'
import IntegrationSettings from '@/pages/IntegrationSettings'
import Workflows from '@/pages/Workflows'
import RecurrentFees from '@/pages/RecurrentFees'
import Analytics from '@/pages/Analytics'
import AdvancedAnalyticsDashboard from '@/pages/AdvancedAnalyticsDashboard'
import AdvancedAnalyticsAdmin from '@/pages/AdvancedAnalyticsAdmin'
import Academia from '@/pages/Academia'
import AdvancedAI from '@/pages/AdvancedAI'
import AIAdmin from '@/pages/AIAdmin'
import IntelligentDashboard from '@/pages/IntelligentDashboard'

import { ProtectedRoute } from '@/components/ProtectedRoute'

import ShareHandler from '@/pages/ShareHandler'
import UploadHandler from '@/pages/UploadHandler'

// Error boundary para providers críticos
const ProviderErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary 
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de inicialización</h2>
          <p className="text-gray-600 mb-4">Ha ocurrido un error al inicializar la aplicación</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recargar aplicación
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
)

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <ProviderErrorBoundary>
        <QueryClient>
          <AppProvider>
            <AdvancedAnalyticsProvider>
              <GlobalStateProvider>
                <BrowserRouter>
                  <Routes>
                    {/* PWA Handler Routes */}
                    <Route path="/share" element={<ShareHandler />} />
                    <Route path="/upload" element={<UploadHandler />} />
                    
                    {/* Existing Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                      <Route element={<MainLayout><Outlet /></MainLayout>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/contacts/:id" element={<ContactDetail />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/:id" element={<ClientDetail />} />
                        <Route path="/cases" element={<Cases />} />
                        <Route path="/proposals" element={<Proposals />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/time-tracking" element={<TimeTracking />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/integrations" element={<IntegrationSettings />} />
                        <Route path="/workflows" element={<Workflows />} />
                        <Route path="/recurrent-fees" element={<RecurrentFees />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/advanced-analytics" element={<AdvancedAnalyticsDashboard />} />
                        <Route path="/advanced-analytics-admin" element={<AdvancedAnalyticsAdmin />} />
                        <Route path="/academia" element={<Academia />} />
                        <Route path="/ai-assistant" element={<AdvancedAI />} />
                        <Route path="/ai-admin" element={<AIAdmin />} />
                        <Route path="/intelligent-dashboard" element={<IntelligentDashboard />} />
                      </Route>
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </GlobalStateProvider>
            </AdvancedAnalyticsProvider>
          </AppProvider>
        </QueryClient>
      </ProviderErrorBoundary>
    </div>
  )
}

export default App
