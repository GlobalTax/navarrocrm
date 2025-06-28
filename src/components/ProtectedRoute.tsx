
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
  const { user, session, isSetup, authLoading } = useApp()
  const location = useLocation()

  console.log('🔒 [ProtectedRoute] Estado:', { user: !!user, session: !!session, isSetup, authLoading })

  // Solo mostrar loading durante carga crítica y por tiempo limitado
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

  // Verificar autenticación
  if (!user && !session) {
    console.log('🔒 [ProtectedRoute] Sin autenticación, redirigiendo a login')
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar setup solo si definitivamente no está configurado
  if (isSetup === false) {
    console.log('🔒 [ProtectedRoute] Sistema no configurado, redirigiendo a setup')
    return <Navigate to="/setup" replace />
  }

  // Verificar roles si se especificaron
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    console.log('🔒 [ProtectedRoute] Sin permisos, redirigiendo a unauthorized')
    return <Navigate to="/unauthorized" replace />
  }

  console.log('🔒 [ProtectedRoute] Acceso permitido')
  return <>{children}</>
}
