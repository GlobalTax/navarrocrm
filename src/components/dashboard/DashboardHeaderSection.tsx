
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { AuthUser } from '@/contexts/types'

interface DashboardHeaderSectionProps {
  user: AuthUser
  lastRefresh: Date
  isLoading: boolean
  onRefresh: () => void
  formatTime: (date: Date) => string
}

export const DashboardHeaderSection = ({ 
  user, 
  lastRefresh, 
  isLoading, 
  onRefresh, 
  formatTime 
}: DashboardHeaderSectionProps) => {
  const welcomeMessage = user?.email?.split('@')[0] || 'Usuario'

  return (
    <>
      <StandardPageHeader
        title={`Bienvenido, ${welcomeMessage}`}
        description="Panel de control con métricas en tiempo real"
        badges={[
          {
            label: `Rol: ${user.role}`,
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          }
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      <div className="text-sm text-gray-500 mb-6">
        Última actualización: {formatTime(lastRefresh)}
      </div>
    </>
  )
}
