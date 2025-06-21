
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
  redirectTo = '/login'
}) => {
  const { user, session, isSetup, isInitializing } = useApp()
  const location = useLocation()

  // Mostrar loading mientras se inicializa
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si el sistema no está configurado, redirigir al setup
  if (isSetup === false) {
    return <Navigate to="/setup" replace />
  }

  // Si no hay usuario/sesión, redirigir al login
  if (!user && !session) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar roles si se especificaron
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
