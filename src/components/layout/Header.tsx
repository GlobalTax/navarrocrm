
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/AppContext'
import { LogOut, User, Search, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const getBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs = [{ name: 'Inicio', href: '/dashboard' }]
  
  const pathMap: Record<string, string> = {
    dashboard: 'Panel de Control',
    clients: 'Clientes',
    cases: 'Casos',
    tasks: 'Tareas',
    'time-tracking': 'Registro de Tiempo'
  }
  
  paths.forEach((path, index) => {
    if (pathMap[path]) {
      breadcrumbs.push({
        name: pathMap[path],
        href: '/' + paths.slice(0, index + 1).join('/')
      })
    }
  })
  
  return breadcrumbs
}

export const Header = () => {
  const { user, signOut } = useApp()
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top section with search and user actions */}
      <div className="px-6 py-3 border-b border-gray-100">
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
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            {/* User info */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
              <User className="h-4 w-4 text-gray-500" />
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
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
      
      {/* Breadcrumbs */}
      <div className="px-6 py-2">
        <nav className="flex items-center text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900">{crumb.name}</span>
              ) : (
                <a 
                  href={crumb.href} 
                  className="hover:text-gray-900 transition-colors"
                >
                  {crumb.name}
                </a>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
