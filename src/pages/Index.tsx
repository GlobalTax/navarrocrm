
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

const Index = () => {
  const { session, user, isSetup, authLoading, setupLoading } = useApp()

  // Mostrar loading solo durante la carga crítica de auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
          {setupLoading && (
            <p className="text-sm text-gray-500 mt-2">
              Verificando configuración...
            </p>
          )}
        </div>
      </div>
    )
  }

  // 1. Si hay sesión válida, ir al dashboard (no esperar setup)
  if (session || user) {
    console.log('✅ [Index] Usuario autenticado → /dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // 2. Si definitivamente no hay setup, ir a setup
  if (isSetup === false && !setupLoading) {
    console.log('🔧 [Index] Sistema no configurado → /setup')
    return <Navigate to="/setup" replace />
  }

  // 3. Sin autenticación, ir al login
  console.log('🔐 [Index] Usuario no autenticado → /login')
  return <Navigate to="/login" replace />
}

export default Index
