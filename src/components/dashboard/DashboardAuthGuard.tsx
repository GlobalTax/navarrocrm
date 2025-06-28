
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { AuthUser } from '@/contexts/types'

interface DashboardAuthGuardProps {
  children: ReactNode
  user: AuthUser | null
  authLoading: boolean
}

export const DashboardAuthGuard = ({ children, user, authLoading }: DashboardAuthGuardProps) => {
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo a login...</p>
        </div>
      </div>
    )
  }

  // Verificación mejorada de org_id
  if (user.org_id === undefined) {
    // Aún cargando el perfil
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil de usuario...</p>
          <p className="text-sm text-gray-500 mt-2">Configurando organización...</p>
        </div>
      </div>
    )
  }

  if (user.org_id === null) {
    // Usuario sin organización - problema de configuración
    return (
      <StandardPageContainer>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración de Organización Requerida
              </h3>
              <p className="text-gray-600 mb-4">
                Tu cuenta necesita ser asociada a una organización para continuar.
              </p>
              <div className="text-sm text-gray-500 mb-6">
                Usuario: {user.email} <br/>
                Estado: {user.role || 'Sin rol asignado'}
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar página
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/setup'} 
                className="w-full"
              >
                Ir a configuración inicial
              </Button>
            </div>
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  // Usuario completamente validado
  console.log('✅ [DashboardAuthGuard] Usuario autorizado:', {
    id: user.id,
    email: user.email,
    role: user.role,
    org_id: user.org_id
  })

  return <>{children}</>
}
