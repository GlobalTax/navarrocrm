
import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PageLoadingSkeleton } from '@/components/layout/PageLoadingSkeleton'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { RouteModule } from '../types'

// Página index - no lazy
import Index from '@/pages/Index'

// Todas las páginas principales con lazy loading
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Emails = lazy(() => import('@/pages/Emails'))
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
const QuantumPage = lazy(() => import('@/pages/QuantumPage'))
const QuantumImport = lazy(() => import('@/pages/QuantumImport'))
const QuantumBilling = lazy(() => import('@/pages/QuantumBilling'))

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoadingSkeleton />}>
    {children}
  </Suspense>
)

export const protectedRoutes: RouteModule = {
  routes: [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/',
          element: (
            <MainLayout>
              <Outlet />
            </MainLayout>
          ),
          children: [
            // Ruta index - no lazy
            {
              path: '/',
              element: <Index />
            },
            // Dashboard y páginas principales
            {
              path: '/dashboard',
              element: <LazyWrapper><Dashboard /></LazyWrapper>
            },
            {
              path: '/emails/*',
              element: <LazyWrapper><Emails /></LazyWrapper>
            },
            // Contactos y clientes
            {
              path: '/contacts',
              element: <LazyWrapper><Contacts /></LazyWrapper>
            },
            {
              path: '/contacts/:id',
              element: <LazyWrapper><ContactDetail /></LazyWrapper>
            },
            {
              path: '/clients',
              element: <LazyWrapper><Clients /></LazyWrapper>
            },
            {
              path: '/client/:id',
              element: <LazyWrapper><ClientDetail /></LazyWrapper>
            },
            // Casos
            {
              path: '/cases',
              element: <LazyWrapper><Cases /></LazyWrapper>
            },
            {
              path: '/cases/:id',
              element: <LazyWrapper><CaseDetail /></LazyWrapper>
            },
            // Propuestas
            {
              path: '/proposals',
              element: <LazyWrapper><Proposals /></LazyWrapper>
            },
            {
              path: '/proposals/:id',
              element: (
                <ProtectedRoute>
                  <LazyWrapper><ProposalDetail /></LazyWrapper>
                </ProtectedRoute>
              )
            },
            // Tareas y tiempo
            {
              path: '/tasks',
              element: <LazyWrapper><Tasks /></LazyWrapper>
            },
            {
              path: '/tasks/:id',
              element: <LazyWrapper><TaskDetail /></LazyWrapper>
            },
            {
              path: '/time-tracking',
              element: <LazyWrapper><TimeTracking /></LazyWrapper>
            },
            // Calendario y salas
            {
              path: '/calendar',
              element: <LazyWrapper><Calendar /></LazyWrapper>
            },
            {
              path: '/rooms',
              element: <LazyWrapper><Rooms /></LazyWrapper>
            },
            {
              path: '/rooms/:roomId/display',
              element: <LazyWrapper><RoomDisplay /></LazyWrapper>
            },
            {
              path: '/equipment',
              element: <LazyWrapper><Equipment /></LazyWrapper>
            },
            // Documentos y usuarios
            {
              path: '/documents',
              element: <LazyWrapper><Documents /></LazyWrapper>
            },
            {
              path: '/users',
              element: <LazyWrapper><Users /></LazyWrapper>
            },
            // Configuración e integraciones
            {
              path: '/integrations',
              element: <LazyWrapper><IntegrationSettings /></LazyWrapper>
            },
            {
              path: '/reports',
              element: <LazyWrapper><Reports /></LazyWrapper>
            },
            {
              path: '/workflows',
              element: <LazyWrapper><Workflows /></LazyWrapper>
            },
            // Academia y AI
            {
              path: '/academia',
              element: <LazyWrapper><Academia /></LazyWrapper>
            },
            {
              path: '/academia/admin',
              element: <LazyWrapper><AcademiaAdmin /></LazyWrapper>
            },
            {
              path: '/ai-assistant',
              element: <LazyWrapper><AdvancedAI /></LazyWrapper>
            },
            {
              path: '/ai-admin',
              element: <LazyWrapper><AIAdmin /></LazyWrapper>
            },
            {
              path: '/dashboard-intelligent',
              element: <LazyWrapper><IntelligentDashboard /></LazyWrapper>
            },
            {
              path: '/security-audit',
              element: <LazyWrapper><SecurityAudit /></LazyWrapper>
            },
            {
              path: '/recurring-fees',
              element: <LazyWrapper><RecurrentFees /></LazyWrapper>
            },
            // Quantum
            {
              path: '/quantum',
              element: <LazyWrapper><QuantumPage /></LazyWrapper>
            },
            {
              path: '/quantum-import',
              element: <LazyWrapper><QuantumImport /></LazyWrapper>
            },
            {
              path: '/quantum-billing',
              element: <LazyWrapper><QuantumBilling /></LazyWrapper>
            }
          ]
        }
      ]
    }
  ]
}
