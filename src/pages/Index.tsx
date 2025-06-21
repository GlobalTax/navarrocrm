
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSystemSetup } from '@/hooks/useSystemSetup'

const Index = () => {
  const { user, loading: authLoading } = useAuth()
  const { isSetup, loading: setupLoading } = useSystemSetup()
  const [emergencyRedirect, setEmergencyRedirect] = useState(false)

  useEffect(() => {
    console.log('🏠 [Index] Estado actual:', {
      authLoading,
      setupLoading,
      user: user ? `Usuario: ${user.id}` : 'Sin usuario',
      isSetup,
      emergencyRedirect
    })
  }, [authLoading, setupLoading, user, isSetup, emergencyRedirect])

  // Timeout de emergencia para evitar carga infinita
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.error('🚨 [Index] TIMEOUT EMERGENCIA: Redirigiendo al login después de 15 segundos')
      setEmergencyRedirect(true)
    }, 15000)

    // Limpiar timeout si ya no está cargando
    if (!authLoading && !setupLoading) {
      clearTimeout(emergencyTimeout)
    }

    return () => clearTimeout(emergencyTimeout)
  }, [authLoading, setupLoading])

  // Redirección de emergencia
  if (emergencyRedirect) {
    console.log('🚨 [Index] Ejecutando redirección de emergencia al login')
    return <Navigate to="/login" replace />
  }

  // Mostrar loading mientras se verifica el estado
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            {setupLoading ? 'Verificando configuración...' : 'Verificando autenticación...'}
          </p>
          <p className="text-xs text-gray-400">
            Si esto tarda mucho, serás redirigido automáticamente
          </p>
        </div>
      </div>
    )
  }

  // 1. Verificar setup del sistema primero
  if (isSetup === false) {
    console.log('🔧 [Index] Sistema no configurado → /setup')
    return <Navigate to="/setup" replace />
  }

  // 2. Verificar autenticación
  if (!user) {
    console.log('🔐 [Index] Usuario no autenticado → /login')
    return <Navigate to="/login" replace />
  }

  // 3. Todo correcto → dashboard
  console.log('✅ [Index] Todo configurado → /dashboard')
  return <Navigate to="/dashboard" replace />
}

export default Index
