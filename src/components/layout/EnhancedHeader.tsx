
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/contexts/AppContext'
import { LogOut, User, Search, Bell, Menu, Sun, Moon, Settings } from 'lucide-react'
import { HeaderClock } from './HeaderClock'
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel'
import { useNotifications } from '@/hooks/useNotifications'

export const EnhancedHeader = () => {
  const { user, signOut } = useApp()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="glass-card border-b border-gray-200/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="responsive-padding py-3">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Logo & Search */}
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-title font-bold text-gray-900">CRM</span>
              </div>
            </div>
            
            {/* Enhanced Search */}
            <div className={`relative max-w-lg flex-1 transition-all duration-300 ${
              searchFocused ? 'scale-105' : ''
            }`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                searchFocused ? 'text-primary' : 'text-gray-400'
              }`} />
              <Input 
                placeholder="Buscar clientes, casos, documentos..." 
                className={`pl-10 pr-4 bg-white/80 border-gray-200 rounded-xl transition-all duration-300 focus-ring ${
                  searchFocused ? 'shadow-elegant bg-white' : 'shadow-sm'
                }`}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
          
          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleDarkMode}
              className="hover-scale rounded-lg"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </Button>

            {/* Enhanced Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`relative hover-scale rounded-lg transition-all duration-200 ${
                  showNotifications ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-3 z-50 animate-fade-in">
                  <NotificationsPanel
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onRemove={removeNotification}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}
            </div>
            
            {/* Header Clock */}
            <div className="hidden md:block">
              <HeaderClock />
            </div>
            
            {/* Enhanced User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl hover-lift transition-all duration-200 ${
                  showUserMenu ? 'bg-primary/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-caption font-semibold text-gray-900">
                      {user?.email?.split('@')[0]}
                    </div>
                    <div className="text-micro text-gray-500">
                      {user?.role}
                    </div>
                  </div>
                </div>
              </Button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-luxury border border-gray-100 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-caption font-semibold text-gray-900">
                      {user?.email?.split('@')[0]}
                    </div>
                    <div className="text-micro text-gray-500">
                      {user?.email}
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-caption">Configuración</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-caption">Mi Perfil</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 transition-colors duration-150 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-caption">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
