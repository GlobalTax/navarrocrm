
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/AppContext'
import { LogOut, User, Search } from 'lucide-react'
import { HeaderClock } from './HeaderClock'
import { AdvancedNotificationCenter } from '@/components/notifications/AdvancedNotificationCenter'

export const Header = () => {
  const { user, signOut } = useApp()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar clientes, casos..." 
              className="pl-10 w-80"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Advanced Notifications */}
            <AdvancedNotificationCenter />
            
            {/* Header Clock */}
            <HeaderClock />
            
            {/* User info */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-800">
              <User className="h-4 w-4 text-gray-500" />
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  {user?.role}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
