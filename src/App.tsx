
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loading de páginas para mejorar performance
const Index = lazy(() => import('@/pages/Index'))
const Login = lazy(() => import('@/pages/Login'))
const Setup = lazy(() => import('@/pages/Setup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Contacts = lazy(() => import('@/pages/Contacts'))
const ClientDetail = lazy(() => import('@/pages/ClientDetail'))
const Cases = lazy(() => import('@/pages/Cases'))
const Proposals = lazy(() => import('@/pages/Proposals'))
const Tasks = lazy(() => import('@/pages/Tasks'))
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
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))
const IntelligentDashboard = lazy(() => import('@/pages/IntelligentDashboard'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Reports = lazy(() => import('@/pages/Reports'))

// Componente de loading optimizado para Suspense
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
)

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
          <Suspense fallback={<PageLoading />}>
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
              
              {/* Special routes */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
