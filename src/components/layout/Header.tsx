
import React, { useState } from 'react'
import { Bell, LogOut, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useApp } from '@/contexts/AppContext'
import { HeaderClock } from './HeaderClock'
import { HeaderTimerDialog } from './HeaderTimerDialog'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton'

export const Header = () => {
  const { user, signOut } = useApp()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)

  const handleSignOut = async () => {
    console.log('🚪 [Header] Iniciando cierre de sesión')
    try {
      await signOut()
      console.log('✅ [Header] Sesión cerrada, navegando a inicio')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('❌ [Header] Error al cerrar sesión:', error)
      // Forzar navegación incluso si hay error
      navigate('/', { replace: true })
    }
  }

  const handleTimerSave = () => {
    setIsTimerDialogOpen(false)
    setTimerSeconds(0)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">
          CRM Asesoría Legal
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <PWAInstallButton />
        
        <HeaderClock />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTimerDialogOpen(true)}
        >
          Timer
        </Button>

        <HeaderTimerDialog
          isOpen={isTimerDialogOpen}
          onClose={() => setIsTimerDialogOpen(false)}
          onSave={handleTimerSave}
          timerSeconds={timerSeconds}
        />

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <NotificationCenter />
            </div>
          )}
        </div>

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || user?.full_name || 'Usuario'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'demo@legalflow.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
