
import { Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { RouteModule } from '../types'
import { createOptimizedLazy, RoutePriority } from '@/utils/routeOptimizer'
import { LazyRouteWrapper, createLazyRoute } from '@/components/routing/LazyRouteWrapper'
import { 
  FeatureBoundary, 
  ClientFeatureBoundary, 
  CaseFeatureBoundary,
  CommunicationFeatureBoundary,
  AdminFeatureBoundary
} from '@/components/routing/FeatureBoundary'

// Página index - no lazy (crítica)
import Index from '@/pages/Index'

// CRITICAL ROUTES - Preloaded with enhanced lazy loading
const Dashboard = createOptimizedLazy(
  () => import('@/pages/Dashboard'),
  RoutePriority.CRITICAL
)
const EnhancedDashboard = createLazyRoute(Dashboard, 'Dashboard', 'critical')

// HIGH PRIORITY - Client Management Bundle
const Contacts = createOptimizedLazy(
  () => import('@/pages/Contacts'),
  RoutePriority.HIGH
)
const ContactDetail = createOptimizedLazy(
  () => import('@/pages/ContactDetail'),
  RoutePriority.HIGH
)
const Clients = createOptimizedLazy(
  () => import('@/pages/Clients'),
  RoutePriority.HIGH
)
const ClientDetail = createOptimizedLazy(
  () => import('@/pages/ClientDetail'),
  RoutePriority.HIGH
)

// Enhanced components with lazy route wrappers
const EnhancedContacts = createLazyRoute(Contacts, 'Contacts', 'high')
const EnhancedContactDetail = createLazyRoute(ContactDetail, 'ContactDetail', 'high')
const EnhancedClients = createLazyRoute(Clients, 'Clients', 'high')
const EnhancedClientDetail = createLazyRoute(ClientDetail, 'ClientDetail', 'high')

// HIGH PRIORITY - Case Management Bundle
const Cases = createOptimizedLazy(
  () => import('@/pages/Cases'),
  RoutePriority.HIGH
)
const CaseDetail = createOptimizedLazy(
  () => import('@/pages/CaseDetail'),
  RoutePriority.HIGH
)
const Tasks = createOptimizedLazy(
  () => import('@/pages/Tasks'),
  RoutePriority.HIGH
)
const TaskDetail = createOptimizedLazy(
  () => import('@/pages/TaskDetail'),
  RoutePriority.HIGH
)

// Enhanced components with lazy route wrappers
const EnhancedCases = createLazyRoute(Cases, 'Cases', 'high')
const EnhancedCaseDetail = createLazyRoute(CaseDetail, 'CaseDetail', 'high')
const EnhancedTasks = createLazyRoute(Tasks, 'Tasks', 'high')
const EnhancedTaskDetail = createLazyRoute(TaskDetail, 'TaskDetail', 'high')

// MEDIUM PRIORITY - Communication Bundle
const Emails = createOptimizedLazy(
  () => import('@/pages/Emails'),
  RoutePriority.MEDIUM
)
const Calendar = createOptimizedLazy(
  () => import('@/pages/Calendar'),
  RoutePriority.MEDIUM
)

// MEDIUM PRIORITY - Business Tools Bundle
const Proposals = createOptimizedLazy(
  () => import('@/pages/Proposals'),
  RoutePriority.MEDIUM
)
const ProposalDetail = createOptimizedLazy(
  () => import('@/pages/ProposalDetail'),
  RoutePriority.MEDIUM
)
const TimeTracking = createOptimizedLazy(
  () => import('@/pages/TimeTracking'),
  RoutePriority.MEDIUM
)
const EnhancedTimeTracking = createLazyRoute(TimeTracking, 'TimeTracking', 'medium')
const Documents = createOptimizedLazy(
  () => import('@/pages/Documents'),
  RoutePriority.MEDIUM
)
const RecurrentFees = createOptimizedLazy(
  () => import('@/pages/RecurrentFees'),
  RoutePriority.MEDIUM
)

// LOW PRIORITY - Admin Bundle (deferred)
const Users = createOptimizedLazy(
  () => import('@/pages/Users'),
  RoutePriority.LOW
)
const Reports = createOptimizedLazy(
  () => import('@/pages/Reports'),
  RoutePriority.LOW
)
const SecurityAudit = createOptimizedLazy(
  () => import('@/pages/SecurityAudit'),
  RoutePriority.LOW
)
const Workflows = createOptimizedLazy(
  () => import('@/pages/Workflows'),
  RoutePriority.LOW
)

// LOW PRIORITY - Integration Bundle (deferred)
const IntegrationSettings = createOptimizedLazy(
  () => import('@/pages/IntegrationSettings'),
  RoutePriority.LOW
)
const QuantumPage = createOptimizedLazy(
  () => import('@/pages/QuantumPage'),
  RoutePriority.LOW
)
const QuantumImport = createOptimizedLazy(
  () => import('@/pages/QuantumImport'),
  RoutePriority.LOW
)
const QuantumBilling = createOptimizedLazy(
  () => import('@/pages/QuantumBilling'),
  RoutePriority.LOW
)

// LOW PRIORITY - AI & Advanced Bundle (deferred)
const AdvancedAI = createOptimizedLazy(
  () => import('@/pages/AdvancedAI'),
  RoutePriority.LOW
)
const AIAdmin = createOptimizedLazy(
  () => import('@/pages/AIAdmin'),
  RoutePriority.LOW
)
const IntelligentDashboard = createOptimizedLazy(
  () => import('@/pages/IntelligentDashboard'),
  RoutePriority.LOW
)
const Academia = createOptimizedLazy(
  () => import('@/pages/Academia'),
  RoutePriority.LOW
)
const AcademiaAdmin = createOptimizedLazy(
  () => import('@/pages/AcademiaAdmin'),
  RoutePriority.LOW
)

// LOW PRIORITY - Facilities Bundle (deferred)
const Rooms = createOptimizedLazy(
  () => import('@/pages/Rooms'),
  RoutePriority.LOW
)
const RoomDisplay = createOptimizedLazy(
  () => import('@/pages/RoomDisplay'),
  RoutePriority.LOW
)
const Equipment = createOptimizedLazy(
  () => import('@/pages/EquipmentPage'),
  RoutePriority.LOW
)
const SubscriptionsPage = createOptimizedLazy(
  () => import('@/pages/SubscriptionsPage'),
  RoutePriority.MEDIUM
)
const OutgoingSubscriptionsPage = createOptimizedLazy(
  () => import('@/pages/OutgoingSubscriptionsPage'),
  RoutePriority.MEDIUM
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
            // CRITICAL - Dashboard (preloaded)
            {
              path: '/dashboard',
              element: (
                <FeatureBoundary feature="Dashboard">
                  <EnhancedDashboard />
                </FeatureBoundary>
              )
            },
            
            // HIGH PRIORITY - Client Management Bundle
            {
              path: '/contacts',
              element: (
                <ClientFeatureBoundary>
                  <EnhancedContacts />
                </ClientFeatureBoundary>
              )
            },
            {
              path: '/contacts/:id',
              element: (
                <ClientFeatureBoundary>
                  <EnhancedContactDetail />
                </ClientFeatureBoundary>
              )
            },
            {
              path: '/clients',
              element: (
                <ClientFeatureBoundary>
                  <EnhancedClients />
                </ClientFeatureBoundary>
              )
            },
            {
              path: '/client/:id',
              element: (
                <ClientFeatureBoundary>
                  <EnhancedClientDetail />
                </ClientFeatureBoundary>
              )
            },
            
            // HIGH PRIORITY - Case Management Bundle
            {
              path: '/cases',
              element: (
                <CaseFeatureBoundary>
                  <EnhancedCases />
                </CaseFeatureBoundary>
              )
            },
            {
              path: '/cases/:id',
              element: (
                <CaseFeatureBoundary>
                  <EnhancedCaseDetail />
                </CaseFeatureBoundary>
              )
            },
            {
              path: '/tasks',
              element: (
                <CaseFeatureBoundary>
                  <EnhancedTasks />
                </CaseFeatureBoundary>
              )
            },
            {
              path: '/tasks/:id',
              element: (
                <CaseFeatureBoundary>
                  <EnhancedTaskDetail />
                </CaseFeatureBoundary>
              )
            },
            
            // MEDIUM PRIORITY - Communication Bundle
            {
              path: '/emails/*',
              element: (
                <CommunicationFeatureBoundary>
                  <Emails />
                </CommunicationFeatureBoundary>
              )
            },
            {
              path: '/calendar',
              element: (
                <CommunicationFeatureBoundary>
                  <Calendar />
                </CommunicationFeatureBoundary>
              )
            },
            
            // MEDIUM PRIORITY - Business Tools Bundle
            {
              path: '/proposals',
              element: (
                <FeatureBoundary feature="Propuestas">
                  <Proposals />
                </FeatureBoundary>
              )
            },
            {
              path: '/proposals/:id',
              element: (
                <ProtectedRoute>
                  <FeatureBoundary feature="Propuestas">
                    <ProposalDetail />
                  </FeatureBoundary>
                </ProtectedRoute>
              )
            },
            {
              path: '/time-tracking',
              element: (
                <FeatureBoundary feature="Control de Tiempo">
                  <EnhancedTimeTracking />
                </FeatureBoundary>
              )
            },
            {
              path: '/documents',
              element: (
                <FeatureBoundary feature="Documentos">
                  <Documents />
                </FeatureBoundary>
              )
            },
            {
              path: '/recurring-fees',
              element: (
                <FeatureBoundary feature="Honorarios Recurrentes">
                  <RecurrentFees />
                </FeatureBoundary>
              )
            },
            {
              path: '/subscriptions',
              element: (
                <FeatureBoundary feature="Suscripciones">
                  <SubscriptionsPage />
                </FeatureBoundary>
              )
            },
            {
              path: '/outgoing-subscriptions',
              element: (
                <FeatureBoundary feature="Suscripciones Externas">
                  <OutgoingSubscriptionsPage />
                </FeatureBoundary>
              )
            },
            
            // LOW PRIORITY - Admin Bundle (deferred loading)
            {
              path: '/users',
              element: (
                <AdminFeatureBoundary>
                  <Users />
                </AdminFeatureBoundary>
              )
            },
            {
              path: '/reports',
              element: (
                <AdminFeatureBoundary>
                  <Reports />
                </AdminFeatureBoundary>
              )
            },
            {
              path: '/security-audit',
              element: (
                <AdminFeatureBoundary>
                  <SecurityAudit />
                </AdminFeatureBoundary>
              )
            },
            {
              path: '/workflows',
              element: (
                <AdminFeatureBoundary>
                  <Workflows />
                </AdminFeatureBoundary>
              )
            },
            
            // LOW PRIORITY - Integration Bundle (deferred)
            {
              path: '/integrations',
              element: (
                <FeatureBoundary feature="Integraciones">
                  <IntegrationSettings />
                </FeatureBoundary>
              )
            },
            {
              path: '/quantum',
              element: (
                <FeatureBoundary feature="Quantum">
                  <QuantumPage />
                </FeatureBoundary>
              )
            },
            {
              path: '/quantum-import',
              element: (
                <FeatureBoundary feature="Quantum Import">
                  <QuantumImport />
                </FeatureBoundary>
              )
            },
            {
              path: '/quantum-billing',
              element: (
                <FeatureBoundary feature="Quantum Billing">
                  <QuantumBilling />
                </FeatureBoundary>
              )
            },
            
            // LOW PRIORITY - AI & Advanced Bundle (deferred)
            {
              path: '/ai-assistant',
              element: (
                <FeatureBoundary feature="AI Assistant">
                  <AdvancedAI />
                </FeatureBoundary>
              )
            },
            {
              path: '/ai-admin',
              element: (
                <AdminFeatureBoundary>
                  <AIAdmin />
                </AdminFeatureBoundary>
              )
            },
            {
              path: '/dashboard-intelligent',
              element: (
                <FeatureBoundary feature="Dashboard Inteligente">
                  <IntelligentDashboard />
                </FeatureBoundary>
              )
            },
            {
              path: '/academia',
              element: (
                <FeatureBoundary feature="Academia">
                  <Academia />
                </FeatureBoundary>
              )
            },
            {
              path: '/academia/admin',
              element: (
                <AdminFeatureBoundary>
                  <AcademiaAdmin />
                </AdminFeatureBoundary>
              )
            },
            
            // LOW PRIORITY - Facilities Bundle (deferred)
            {
              path: '/rooms',
              element: (
                <FeatureBoundary feature="Salas">
                  <Rooms />
                </FeatureBoundary>
              )
            },
            {
              path: '/rooms/:roomId/display',
              element: (
                <FeatureBoundary feature="Display de Sala">
                  <RoomDisplay />
                </FeatureBoundary>
              )
            },
            {
              path: '/equipment',
              element: (
                <FeatureBoundary feature="Equipamiento">
                  <Equipment />
                </FeatureBoundary>
              )
            }
          ]
        }
      ]
    }
  ]
}
