
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client')[]
  redirectTo?: string
  requireRealUser?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login',
  requireRealUser = false
}) => {
  const { user, authLoading } = useApp()
  const location = useLocation()

  // Mostrar loading durante carga inicial
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

  // Si no hay usuario en absoluto
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Si se requiere usuario real y el actual es temporal
  if (requireRealUser && user.app_metadata?.temp_user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar roles si se especificaron
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
