
import { useState } from 'react'
import { Search, Bell, Settings, User, Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { HeaderClock } from './HeaderClock'
import { HeaderTimerDialog } from './HeaderTimerDialog'
import { useApp } from '@/contexts/AppContext'

export const EnhancedHeader = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { user } = useApp()

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Logo y navegación móvil */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CRM</span>
            </div>
            <span className="font-semibold text-lg gradient-text">LegalCRM</span>
          </div>
        </div>

        {/* Búsqueda global mejorada */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes, casos, documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
            />
            {searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-floating z-50">
                <div className="p-4 text-sm text-muted-foreground">
                  Resultados para "{searchQuery}"...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-3">
          
          {/* Reloj mejorado */}
          <div className="hidden md:block">
            <HeaderClock />
          </div>

          {/* Timer button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTimerOpen(true)}
            className="hidden sm:flex hover-scale"
          >
            ⏱️ Timer
          </Button>

          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover-scale">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover/95 backdrop-blur-sm">
              <div className="p-4 border-b border-border">
                <h4 className="font-semibold">Notificaciones</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="p-4 flex-col items-start hover:bg-accent/50">
                  <div className="font-medium">Nueva propuesta enviada</div>
                  <div className="text-sm text-muted-foreground">Cliente ABC Corp - hace 2 horas</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 flex-col items-start hover:bg-accent/50">
                  <div className="font-medium">Reunión en 30 minutos</div>
                  <div className="text-sm text-muted-foreground">Sala de juntas - 14:30</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 flex-col items-start hover:bg-accent/50">
                  <div className="font-medium">Factura vencida</div>
                  <div className="text-sm text-muted-foreground">INV-2024-001 - €2,500</div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Configuración */}
          <Button variant="ghost" size="icon" className="hover-scale">
            <Settings className="h-5 w-5" />
          </Button>

          {/* Modo oscuro */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="hover-scale"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Perfil de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
                <Avatar className="h-10 w-10 ring-2 ring-border">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name || 'Usuario'} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm">
              <div className="p-3 border-b border-border">
                <p className="font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem className="hover:bg-accent/50">
                <User className="h-4 w-4 mr-2" />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent/50">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timer Dialog */}
      <HeaderTimerDialog open={isTimerOpen} onOpenChange={setIsTimerOpen} />
    </header>
  )
}
