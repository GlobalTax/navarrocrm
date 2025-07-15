
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { OnboardingProvider } from '@/components/onboarding'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageLoadingSkeleton } from '@/components/layout/PageLoadingSkeleton'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'

// Páginas críticas cargadas estáticamente (no lazy)
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Setup from '@/pages/Setup'
import Unauthorized from '@/pages/Unauthorized'
import NotFound from '@/pages/NotFound'

const Emails = lazy(() => import('@/pages/Emails'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Contacts = lazy(() => import('@/pages/Contacts'))
const ContactDetail = lazy(() => import('@/pages/ContactDetail'))
const ClientDetail = lazy(() => import('@/pages/ClientDetail'))
const Cases = lazy(() => import('@/pages/Cases'))
const CaseDetail = lazy(() => import('@/pages/CaseDetail'))
const Proposals = lazy(() => import('@/pages/Proposals'))
const ProposalDetail = lazy(() => import('@/pages/ProposalDetail'))
const Tasks = lazy(() => import('@/pages/Tasks'))
const TaskDetail = lazy(() => import('@/pages/TaskDetail'))
const TimeTracking = lazy(() => import('@/pages/TimeTracking'))
const Calendar = lazy(() => import('@/pages/Calendar'))
const Documents = lazy(() => import('@/pages/Documents'))
const Users = lazy(() => import('@/pages/Users'))
const Academia = lazy(() => import('@/pages/Academia'))
const AIAdmin = lazy(() => import('@/pages/AIAdmin'))
const Workflows = lazy(() => import('@/pages/Workflows'))
const RecurrentFees = lazy(() => import('@/pages/RecurrentFees'))
const AdvancedAI = lazy(() => import('@/pages/AdvancedAI'))
const IntegrationSettings = lazy(() => import('@/pages/IntegrationSettings'))
const IntelligentDashboard = lazy(() => import('@/pages/IntelligentDashboard'))
const Reports = lazy(() => import('@/pages/Reports'))
const SecurityAudit = lazy(() => import('@/pages/SecurityAudit'))
const Clients = lazy(() => import('@/pages/Clients'))
const AcademiaAdmin = lazy(() => import('@/pages/AcademiaAdmin'))
const Rooms = lazy(() => import('@/pages/Rooms'))
const RoomDisplay = lazy(() => import('@/pages/RoomDisplay'))
const Equipment = lazy(() => import('@/pages/EquipmentPage'))
const EmployeeOnboarding = lazy(() => import('@/pages/EmployeeOnboarding'))
const EmployeeOnboardingSuccess = lazy(() => import('@/pages/EmployeeOnboardingSuccess'))
const OutlookCallback = lazy(() => import('@/pages/OutlookCallback'))
const QuantumPage = lazy(() => import('@/pages/QuantumPage'))
const QuantumImport = lazy(() => import('@/pages/QuantumImport'))

// Página pública - no necesita lazy loading por su naturaleza crítica
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
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <OnboardingProvider>
            <Toaster position="top-right" />
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Ruta pública para el panel de ocupación - no lazy */}
              <Route path="/panel-ocupacion" element={<RoomOccupancyPanel />} />
              
              {/* Rutas de auth - no lazy para experiencia crítica */}
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route 
                path="/employee-onboarding" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <EmployeeOnboarding />
                  </Suspense>
                } 
              />
              <Route 
                path="/employee-onboarding/success" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <EmployeeOnboardingSuccess />
                  </Suspense>
                } 
              />
              <Route 
                path="/auth/outlook/callback" 
                element={
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <OutlookCallback />
                  </Suspense>
                } 
              />
              
              <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route element={<MainLayout><Outlet /></MainLayout>}>
                  {/* Ruta index - no lazy */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Todas las rutas principales con lazy loading */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Dashboard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/emails/*" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Emails />
                      </Suspense>
                    } 
                  />
                  <Route
                    path="/contacts" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Contacts />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/contacts/:id" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <ContactDetail />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/clients" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Clients />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/client/:id" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <ClientDetail />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/cases" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Cases />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/cases/:id" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <CaseDetail />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/proposals" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Proposals />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/proposals/:id" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoadingSkeleton />}>
                          <ProposalDetail />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tasks" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Tasks />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tasks/:id" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <TaskDetail />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/time-tracking" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <TimeTracking />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/calendar" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Calendar />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/rooms" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Rooms />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/rooms/:roomId/display" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <RoomDisplay />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/equipment" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Equipment />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/documents" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Documents />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Users />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/integrations" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <IntegrationSettings />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/reports" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Reports />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/workflows" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Workflows />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/academia" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <Academia />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/academia/admin" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <AcademiaAdmin />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/ai-assistant" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <AdvancedAI />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/ai-admin" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <AIAdmin />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/dashboard-intelligent" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <IntelligentDashboard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/security-audit" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <SecurityAudit />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/recurring-fees" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <RecurrentFees />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/quantum" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <QuantumPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/quantum-import" 
                    element={
                      <Suspense fallback={<PageLoadingSkeleton />}>
                        <QuantumImport />
                      </Suspense>
                    } 
                  />
                </Route>
              </Route>
              
              {/* 404 - no lazy */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          </Router>
          </OnboardingProvider>
        </AppProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}

export default App
