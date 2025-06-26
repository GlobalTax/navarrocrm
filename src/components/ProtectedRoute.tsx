
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { useRef, useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client')[]
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/'
}) => {
  const { user, authLoading } = useApp()
  const location = useLocation()
  
  // Control de redirección para evitar bucles
  const redirectAttemptRef = useRef(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Resetear estado cuando cambia la ubicación
  useEffect(() => {
    redirectAttemptRef.current = false
    setShouldRedirect(false)
  }, [location.pathname])

  // Mostrar loading durante la carga inicial
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario y no hemos intentado redireccionar
  if (!user && !redirectAttemptRef.current) {
    console.log('🔒 [ProtectedRoute] Usuario no autenticado, redirigiendo a:', redirectTo)
    redirectAttemptRef.current = true
    
    // Redireccionar después de un pequeño delay para evitar bucles
    timeoutRef.current = setTimeout(() => {
      setShouldRedirect(true)
    }, 100)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Ejecutar redirección si está marcada
  if (shouldRedirect && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar roles si se especificaron
  if (user && allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    console.log('🚫 [ProtectedRoute] Usuario sin permisos para:', location.pathname)
    return <Navigate to="/unauthorized" replace />
  }

  // Si llegamos aquí, el usuario está autenticado
  if (user) {
    return <>{children}</>
  }

  // Fallback: mostrar loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
