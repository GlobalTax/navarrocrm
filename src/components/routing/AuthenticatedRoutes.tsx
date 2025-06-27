// src/components/routing/AuthenticatedRoutes.tsx

import { Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Cases from '@/pages/Cases'
import Clients from '@/pages/Clients'
import Contacts from '@/pages/Contacts'
import ClientDetail from '@/pages/ClientDetail'
import ContactDetail from '@/pages/ContactDetail'
import TimeTracking from '@/pages/TimeTracking'
import Tasks from '@/pages/Tasks'
import Calendar from '@/pages/Calendar'
import Documents from '@/pages/Documents'
import Proposals from '@/pages/Proposals'
import RecurrentFees from '@/pages/RecurrentFees'
import Reports from '@/pages/Reports'
import Analytics from '@/pages/Analytics'
import AdvancedAnalyticsDashboard from '@/pages/AdvancedAnalyticsDashboard'
import PredictiveAnalytics from '@/pages/PredictiveAnalytics'
import AdvancedAnalyticsAdmin from '@/pages/AdvancedAnalyticsAdmin'
import IntelligentDashboard from '@/pages/IntelligentDashboard'
import Users from '@/pages/Users'
import IntegrationSettings from '@/pages/IntegrationSettings'
import AdvancedAI from '@/pages/AdvancedAI'
import EnhancedAdvancedAI from '@/pages/EnhancedAdvancedAI'
import Academia from '@/pages/Academia'
import AIAdmin from '@/pages/AIAdmin'
import Workflows from '@/pages/Workflows'
import Deals from '@/pages/Deals'
import OfficeManagement from '@/pages/OfficeManagement'  // Nueva importación
import { lazy, Suspense } from 'react'

const LazyBulkTasks = lazy(() => import('@/pages/BulkTasks'))

export const AuthenticatedRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/cases" element={<Cases />} />
    <Route path="/clients" element={<Clients />} />
    <Route path="/clients/:id" element={<ClientDetail />} />
    <Route path="/contacts" element={<Contacts />} />
    <Route path="/contacts/:id" element={<ContactDetail />} />
    <Route path="/time-tracking" element={<TimeTracking />} />
    <Route path="/tasks" element={<Tasks />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/documents" element={<Documents />} />
    <Route path="/proposals" element={<Proposals />} />
    <Route path="/recurrent-fees" element={<RecurrentFees />} />
    <Route path="/office-management" element={<OfficeManagement />} />  {/* Nueva ruta */}
    <Route path="/reports" element={<Reports />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/advanced-analytics-dashboard" element={<AdvancedAnalyticsDashboard />} />
    <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
    <Route path="/advanced-analytics-admin" element={<AdvancedAnalyticsAdmin />} />
    <Route path="/intelligent-dashboard" element={<IntelligentDashboard />} />
    <Route path="/users" element={<Users />} />
    <Route path="/integration-settings" element={<IntegrationSettings />} />
    <Route path="/advanced-ai" element={<AdvancedAI />} />
    <Route path="/enhanced-advanced-ai" element={<EnhancedAdvancedAI />} />
    <Route path="/academia" element={<Academia />} />
    <Route path="/ai-admin" element={<AIAdmin />} />
    <Route path="/workflows" element={<Workflows />} />
    <Route path="/deals" element={<Deals />} />
    <Route path="/bulk-tasks" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <LazyBulkTasks />
      </Suspense>
    } />
  </Routes>
)
