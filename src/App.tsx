import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './contexts/AppContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
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
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'
import { QueryClient } from './contexts/QueryContext'
import IntelligentDashboard from './pages/IntelligentDashboard'
import Workflows from './pages/Workflows'

function App() {
  return (
    <QueryClient>
      <AppProvider>
        <Router>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/cases" element={<Cases />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/proposals" element={<Proposals />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/time-tracking" element={<TimeTracking />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/intelligent-dashboard" element={<IntelligentDashboard />} />
                    <Route path="/integrations" element={<IntegrationSettings />} />
                    <Route path="/ai-admin" element={<AIAdmin />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </QueryClient>
  )
}

export default App
