
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSystemSetup } from '@/hooks/useSystemSetup'

const Index = () => {
  const { user, session, loading: authLoading } = useAuth()
  const { isSetup, loading: setupLoading } = useSystemSetup()
  const [emergencyRedirect, setEmergencyRedirect] = useState<string | false>(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const currentState = {
      authLoading,
      setupLoading,
      user: user ? `Usuario: ${user.id}` : 'Sin usuario',
      session: session ? `Sesión: ${session.user.id}` : 'Sin sesión',
      isSetup,
      emergencyRedirect
    }
    
    console.log('🏠 [Index] Estado actual:', currentState)
    setDebugInfo(`Auth: ${authLoading ? 'Cargando' : 'Listo'}, Setup: ${setupLoading ? 'Cargando' : 'Listo'}, Session: ${session ? 'Sí' : 'No'}`)
  }, [authLoading, setupLoading, user, session, isSetup, emergencyRedirect])

  // Timeout de emergencia mejorado
  useEffect(() => {
    if (authLoading || setupLoading) {
      console.log('⏰ [Index] Iniciando timeout de emergencia (12s)')
      
      const emergencyTimeout = setTimeout(() => {
        console.error('🚨 [Index] TIMEOUT EMERGENCIA: Estado después de 12 segundos:', {
          authLoading,
          setupLoading,
          userExists: !!user,
          sessionExists: !!session,
          isSetup
        })
        
        // Lógica de redirección más inteligente basada en session
        if (!authLoading && !session) {
          console.log('🔐 [Index] Forzar redirección a login - no hay sesión')
          setEmergencyRedirect('login')
          return
        }
        
        if (!authLoading && session) {
          // Si hay sesión válida, ir a dashboard independientemente del perfil de usuario
          console.log('📊 [Index] Forzar redirección a dashboard - sesión válida presente')
          setEmergencyRedirect('dashboard')
          return
        }
        
        // Fallback por defecto
        console.log('🔐 [Index] Forzar redirección a login por timeout general')
        setEmergencyRedirect('login')
      }, 12000) // Aumentado a 12 segundos

      return () => {
        console.log('⏰ [Index] Cancelando timeout de emergencia')
        clearTimeout(emergencyTimeout)
      }
    }
  }, [authLoading, setupLoading, user, session, isSetup])

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
            Si esto toma más de 12 segundos, serás redirigido automáticamente
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

  // 2. Verificar autenticación (priorizar session sobre user)
  if (!session && !user) {
    console.log('🔐 [Index] Sin sesión ni usuario → /login')
    return <Navigate to="/login" replace />
  }

  // 3. Si hay sesión válida, permitir acceso aunque no haya perfil completo
  if (session) {
    console.log('✅ [Index] Sesión válida encontrada → /dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // 4. Fallback: si hay usuario pero no sesión
  if (user) {
    console.log('✅ [Index] Usuario encontrado → /dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // 5. Fallback final
  console.log('🔐 [Index] Fallback final → /login')
  return <Navigate to="/login" replace />
}

export default Index
