
import { HeaderClock } from './HeaderClock'
import { AdvancedNotificationCenter } from '@/components/notifications/AdvancedNotificationCenter'
import { Button } from '@/components/ui/button'
import { User, Settings } from 'lucide-react'

export const Header: React.FC = () => {
  console.log('🔧 [Header] Renderizando header')

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <HeaderClock />
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
