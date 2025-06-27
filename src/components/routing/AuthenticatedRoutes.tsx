
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SignupPlaceholder } from '@/components/auth/SignupPlaceholder'
import Dashboard from '@/pages/Dashboard'
import Cases from '@/pages/Cases'
import Tasks from '@/pages/Tasks'
import Proposals from '@/pages/Proposals'
import TimeTracking from '@/pages/TimeTracking'
import AIAdmin from '@/pages/AIAdmin'
import AdvancedAI from '@/pages/AdvancedAI'
import IntelligentDashboardPage from '@/pages/IntelligentDashboard'
import PredictiveAnalytics from '@/pages/PredictiveAnalytics'
import Workflows from '@/pages/Workflows'
import Contacts from '@/pages/Contacts'
import EnhancedAdvancedAI from '@/pages/EnhancedAdvancedAI'
import Login from '@/pages/Login'

export const AuthenticatedRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignupPlaceholder />} />
    
    {/* Rutas protegidas */}
    <Route path="/dashboard" element={
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
    <Route path="/predictive-analytics" element={
      <ProtectedRoute>
        <MainLayout>
          <PredictiveAnalytics />
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
    
    {/* Redirección de /clients a /contacts para compatibilidad */}
    <Route path="/clients" element={<Navigate to="/contacts" replace />} />
    
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)
