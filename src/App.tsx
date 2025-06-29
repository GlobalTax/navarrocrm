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
import ContactDetail from '@/pages/ContactDetail'
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
import Clients from '@/pages/Clients'
import AcademiaAdmin from '@/pages/AcademiaAdmin'
import Rooms from '@/pages/Rooms'
import RoomDisplay from '@/pages/RoomDisplay'
import RoomOccupancyPanel from '@/pages/RoomOccupancyPanel'

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
        <Toaster position="top-right" />
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Ruta pública para el panel de ocupación */}
              <Route path="/panel-ocupacion" element={<RoomOccupancyPanel />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/contacts/:id" element={<ContactDetail />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/client/:id" element={<ClientDetail />} />
                  <Route path="/cases" element={<Cases />} />
                  <Route path="/cases/:id" element={<CaseDetail />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/time-tracking" element={<TimeTracking />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/rooms/:roomId/display" element={<RoomDisplay />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/integrations" element={<IntegrationSettings />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/academia" element={<Academia />} />
                  <Route path="/academia/admin" element={<AcademiaAdmin />} />
                  <Route path="/ai-assistant" element={<AdvancedAI />} />
                  <Route path="/ai-admin" element={<AIAdmin />} />
                  <Route path="/dashboard-intelligent" element={<IntelligentDashboard />} />
                  <Route path="/security-audit" element={<SecurityAudit />} />
                  <Route path="/recurring-fees" element={<RecurrentFees />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
