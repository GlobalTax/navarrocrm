
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
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
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    )
  }

  // Mejorar la validación del org_id con timeout para el enriquecimiento
  if (!user.org_id) {
    // Dar un poco más de tiempo para que el enriquecimiento complete
    // Si el usuario está autenticado pero no tiene org_id, puede ser que aún esté cargando
    const isLikelyStillEnriching = !user.role || user.role === 'junior'
    
    if (isLikelyStillEnriching) {
      // Mostrar loading un poco más de tiempo para el enriquecimiento
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil de usuario...</p>
            <p className="text-sm text-gray-500 mt-2">Obteniendo información de la organización</p>
          </div>
        </div>
      )
    }

    // Si definitivamente no hay org_id después del enriquecimiento
    return (
      <StandardPageContainer>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuración de Organización Requerida
              </h3>
              <p className="text-gray-600 mb-6">
                Tu cuenta no está asociada a ninguna organización. Esto puede deberse a que el sistema aún no ha completado la configuración inicial.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Usuario: {user.email} <br/>
                ID: {user.id}
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar página
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/setup'} className="w-full">
                Ir a configuración
              </Button>
            </div>
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  // Usuario completamente validado con org_id
  console.log('✅ [DashboardAuthGuard] Usuario autorizado para dashboard:', {
    id: user.id,
    email: user.email,
    role: user.role,
    org_id: user.org_id
  })

  return <>{children}</>
}
