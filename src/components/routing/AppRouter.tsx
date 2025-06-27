
import { BrowserRouter } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen'
import { SetupRoutes } from './SetupRoutes'
import { UnauthenticatedRoutes } from './UnauthenticatedRoutes'
import { AuthenticatedRoutes } from './AuthenticatedRoutes'

export const AppRouter = () => {
  const { user, authLoading, isSetup, setupLoading } = useApp()

  // Show loading while checking auth and setup
  if (authLoading || setupLoading) {
    return <AuthLoadingScreen message="Cargando aplicación..." />
  }

  // If system is not set up, redirect to setup
  if (!isSetup) {
    return (
      <BrowserRouter>
        <SetupRoutes />
      </BrowserRouter>
    )
  }

  // If no user and system is setup, show login or index
  if (!user) {
    return (
      <BrowserRouter>
        <UnauthenticatedRoutes />
      </BrowserRouter>
    )
  }

  // Debug: log user state
  console.log('🔍 [App] Usuario actual:', { 
    id: user.id, 
    email: user.email, 
    role: user.role, 
    org_id: user.org_id 
  })

  // If user exists but no org_id, redirect to setup ONLY if we're certain the profile enrichment is complete
  if (user && user.org_id === undefined) {
    console.log('⚠️ [App] Usuario sin org_id, redirigiendo a setup')
    return (
      <BrowserRouter>
        <SetupRoutes />
      </BrowserRouter>
    )
  }

  // Normal app flow for authenticated users with org_id
  console.log('✅ [App] Usuario autenticado con org_id, mostrando aplicación completa')
  return (
    <BrowserRouter>
      <AuthenticatedRoutes />
    </BrowserRouter>
  )
}
