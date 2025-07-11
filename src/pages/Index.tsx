
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

const Index = () => {
  const { session, user, isSetup, authLoading, setupLoading } = useApp()

  console.log('📍 [Index] Estado completo:', { 
    session: !!session, 
    user: !!user, 
    isSetup, 
    authLoading,
    setupLoading,
    sessionUser: session?.user?.email 
  })

  // Loading más inteligente con timeout de emergencia
  if (authLoading || setupLoading) {
    console.log('📍 [Index] Mostrando loading:', { authLoading, setupLoading })
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {authLoading && setupLoading ? 'Inicializando aplicación...' :
             authLoading ? 'Verificando autenticación...' :
             'Verificando configuración...'}
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            Auth: {authLoading ? '⏳' : '✅'} | Setup: {setupLoading ? '⏳' : '✅'}
          </div>
        </div>
      </div>
    )
  }

  // Si el sistema no está configurado, ir a setup
  if (isSetup === false) {
    console.log('📍 [Index] Sistema no configurado, redirigiendo a setup')
    return <Navigate to="/setup" replace />
  }

  // Si no hay sesión, ir a login
  if (!session && !user) {
    console.log('📍 [Index] Sin autenticación, redirigiendo a login')
    return <Navigate to="/login" replace />
  }

  // Si hay usuario autenticado, redirigir al dashboard
  console.log('📍 [Index] Usuario autenticado, redirigiendo a dashboard')
  return <Navigate to="/dashboard" replace />
}

export default Index
