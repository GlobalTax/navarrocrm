
import { BrowserRouter } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen'
import { SetupRoutes } from './SetupRoutes'
import { UnauthenticatedRoutes } from './UnauthenticatedRoutes'
import { AuthenticatedRoutes } from './AuthenticatedRoutes'

export const AppRouter = () => {
  const { user, authLoading, isSetup, setupLoading } = useApp()

  console.log('🚦 [AppRouter] Estado actual:', {
    user: user ? { id: user.id, email: user.email, org_id: user.org_id } : null,
    authLoading,
    isSetup,
    setupLoading
  })

  // Show loading while checking auth and setup
  if (authLoading || setupLoading) {
    return <AuthLoadingScreen message="Verificando configuración del sistema..." />
  }

  // Lógica mejorada para determinar si el sistema necesita configuración
  if (isSetup === false) {
    console.log('🔧 [AppRouter] Sistema no configurado - mostrando setup')
    return (
      <BrowserRouter>
        <SetupRoutes />
      </BrowserRouter>
    )
  }

  // Si no hay usuario autenticado pero el sistema está configurado
  if (!user) {
    console.log('👤 [AppRouter] Usuario no autenticado - mostrando rutas públicas')
    return (
      <BrowserRouter>
        <UnauthenticatedRoutes />
      </BrowserRouter>
    )
  }

  // Verificación mejorada de usuario con org_id
  if (user && typeof user.org_id === 'undefined') {
    console.log('⚠️ [AppRouter] Usuario sin org_id definido - esperando enriquecimiento')
    return <AuthLoadingScreen message="Cargando perfil de usuario..." />
  }

  if (user && user.org_id === null) {
    console.log('🚨 [AppRouter] Usuario con org_id null - problema de configuración')
    return (
      <BrowserRouter>
        <SetupRoutes />
      </BrowserRouter>
    )
  }

  // Usuario completamente configurado
  console.log('✅ [AppRouter] Usuario autenticado y configurado - mostrando aplicación')
  return (
    <BrowserRouter>
      <AuthenticatedRoutes />
    </BrowserRouter>
  )
}
