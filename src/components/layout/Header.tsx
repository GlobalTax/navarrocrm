
import { HeaderClock } from './HeaderClock'
import { AdvancedNotificationCenter } from '@/components/notifications/AdvancedNotificationCenter'
import { Button } from '@/components/ui/button'
import { User, Settings, RefreshCw } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { getRoleDisplayName } from '@/utils/dashboardPermissions'

export const Header: React.FC = () => {
  console.log('🔧 [Header] Renderizando header')
  
  const { user } = useApp()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <HeaderClock />
          {user && (
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900 font-manrope">
                Bienvenido, {user.full_name || user.email}
              </h2>
              <p className="text-sm text-gray-600">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <AdvancedNotificationCenter />
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
