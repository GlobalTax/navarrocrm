
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSystemSetup } from '@/hooks/useSystemSetup'

const Index = () => {
  const { user, loading: authLoading } = useAuth()
  const { isSetup, loading: setupLoading } = useSystemSetup()

  useEffect(() => {
    console.log('🏠 Index - Estado:', {
      authLoading,
      setupLoading,
      user: user ? 'Usuario autenticado' : 'Sin usuario',
      isSetup
    })
  }, [authLoading, setupLoading, user, isSetup])

  // Mostrar loading mientras se verifica el estado
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {setupLoading ? 'Verificando configuración...' : 'Cargando...'}
          </p>
        </div>
      </div>
    )
  }

  // Si el sistema no está configurado, redirigir al setup
  if (isSetup === false) {
    console.log('🔧 Redirigiendo al setup - sistema no configurado')
    return <Navigate to="/setup" replace />
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.log('🔐 Redirigiendo al login - usuario no autenticado')
    return <Navigate to="/login" replace />
  }

  // Si todo está bien, redirigir al dashboard
  console.log('✅ Redirigiendo al dashboard - todo configurado')
  return <Navigate to="/dashboard" replace />
}

export default Index
