
import { Navigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()

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

  // Si no hay usuario - redirección DIRECTA
  if (!user) {
    console.log('🔒 [ProtectedRoute] Usuario no autenticado, redirigiendo a:', redirectTo)
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar roles si se especificaron
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    console.log('🚫 [ProtectedRoute] Usuario sin permisos para:', location.pathname)
    return <Navigate to="/unauthorized" replace />
  }

  // Usuario autenticado y autorizado
  return <>{children}</>
}
