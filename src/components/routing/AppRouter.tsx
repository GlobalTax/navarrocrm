
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

  // If user exists and has org_id, show main app
  if (user && user.org_id) {
    console.log('✅ [App] Usuario autenticado con org_id, mostrando aplicación completa')
    return (
      <BrowserRouter>
        <AuthenticatedRoutes />
      </BrowserRouter>
    )
  }

  // If user exists but no org_id is still loading (undefined vs null)
  if (user && user.org_id === undefined) {
    console.log('⏳ [App] Esperando enriquecimiento del perfil de usuario...')
    return <AuthLoadingScreen message="Configurando perfil de usuario..." />
  }

  // Fallback: if user exists but org_id is null, redirect to setup
  console.log('⚠️ [App] Usuario sin org_id válido, redirigiendo a setup')
  return (
    <BrowserRouter>
      <SetupRoutes />
    </BrowserRouter>
  )
}
