
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { AuthUser } from '@/contexts/types'
import { getRoleDisplayName } from '@/utils/dashboardPermissions'

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
  const roleDisplay = getRoleDisplayName(user.role)
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">
          Bienvenido, {user.full_name || user.email}
        </h1>
        <p className="text-gray-600 mt-1">
          {roleDisplay} • Última actualización: {formatTime(lastRefresh)}
        </p>
      </div>
      
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="border-0.5 border-black rounded-[10px] font-manrope"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
    </div>
  )
}
