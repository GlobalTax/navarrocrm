
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

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
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('🔒 [ProtectedRoute] Usuario no autenticado, redirigiendo a:', redirectTo)
        navigate(redirectTo, { state: { from: location }, replace: true })
      } else if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        console.log('🚫 [ProtectedRoute] Usuario sin permisos para:', location.pathname)
        navigate('/unauthorized', { replace: true })
      }
    }
  }, [user, authLoading, allowedRoles, navigate, location, redirectTo])

  // Mostrar loading mientras se verifica autenticación
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

  // Si no hay usuario, mostrar loading mientras se redirige
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Verificar permisos de rol
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Usuario autenticado y autorizado
  return <>{children}</>
}
