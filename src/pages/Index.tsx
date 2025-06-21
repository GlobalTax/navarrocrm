
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSystemSetup } from '@/hooks/useSystemSetup'

const Index = () => {
  const { user, loading: authLoading } = useAuth()
  const { isSetup, loading: setupLoading } = useSystemSetup()
  const [emergencyRedirect, setEmergencyRedirect] = useState<string | false>(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const currentState = {
      authLoading,
      setupLoading,
      user: user ? `Usuario: ${user.id}` : 'Sin usuario',
      isSetup,
      emergencyRedirect
    }
    
    console.log('🏠 [Index] Estado actual:', currentState)
    setDebugInfo(`Auth: ${authLoading ? 'Cargando' : 'Listo'}, Setup: ${setupLoading ? 'Cargando' : 'Listo'}, User: ${user ? 'Sí' : 'No'}`)
  }, [authLoading, setupLoading, user, isSetup, emergencyRedirect])

  // Timeout de emergencia más largo y con mejor logging
  useEffect(() => {
    if (authLoading || setupLoading) {
      console.log('⏰ [Index] Iniciando timeout de emergencia (15s)')
      
      const emergencyTimeout = setTimeout(() => {
        console.error('🚨 [Index] TIMEOUT EMERGENCIA: Estado después de 15 segundos:', {
          authLoading,
          setupLoading,
          userExists: !!user,
          isSetup
        })
        
        // Si auth está cargado pero setup no, ir a setup
        if (!authLoading && setupLoading && isSetup === null) {
          console.log('🔧 [Index] Forzar redirección a setup por timeout')
          setEmergencyRedirect('setup')
          return
        }
        
        // Si hay usuario pero algo está bloqueado, ir a dashboard
        if (!authLoading && user && isSetup !== false) {
          console.log('📊 [Index] Forzar redirección a dashboard por timeout')
          setEmergencyRedirect('dashboard')
          return
        }
        
        // En otros casos, ir a login
        console.log('🔐 [Index] Forzar redirección a login por timeout')
        setEmergencyRedirect('login')
      }, 15000)

      return () => {
        console.log('⏰ [Index] Cancelando timeout de emergencia')
        clearTimeout(emergencyTimeout)
      }
    }
  }, [authLoading, setupLoading, user, isSetup])

  // Redirección de emergencia específica
  if (emergencyRedirect) {
    const redirectTo = emergencyRedirect === 'setup' ? '/setup' : 
                     emergencyRedirect === 'dashboard' ? '/dashboard' : '/login'
    console.log(`🚨 [Index] Ejecutando redirección de emergencia a ${redirectTo}`)
    return <Navigate to={redirectTo} replace />
  }

  // Mostrar loading con más información
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">
            {setupLoading ? 'Verificando configuración del sistema...' : 'Cargando perfil de usuario...'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {debugInfo}
          </p>
          <div className="text-xs text-gray-300">
            Si esto toma más de 15 segundos, serás redirigido automáticamente
          </div>
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
