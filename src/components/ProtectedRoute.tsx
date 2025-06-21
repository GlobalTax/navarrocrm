
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSystemSetup } from '@/hooks/useSystemSetup'

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
  const { user, loading: authLoading } = useAuth()
  const { isSetup, loading: setupLoading } = useSystemSetup()
  const location = useLocation()

  // Mostrar loading mientras se verifican los estados
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {setupLoading ? 'Verificando configuración...' : 'Verificando autenticación...'}
          </p>
        </div>
      </div>
    )
  }

  // Si el sistema no está configurado, redirigir al setup
  if (isSetup === false) {
    return <Navigate to="/setup" replace />
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar roles si se especificaron
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
