
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  FolderOpen, 
  Clock, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['partner', 'area_manager', 'senior', 'junior', 'finance'] },
  { icon: Users, label: 'Clientes', path: '/clients', roles: ['partner', 'area_manager', 'senior', 'junior'] },
  { icon: FolderOpen, label: 'Casos', path: '/cases', roles: ['partner', 'area_manager', 'senior', 'junior'] },
  { icon: Clock, label: 'Tiempo', path: '/time', roles: ['partner', 'area_manager', 'senior', 'junior'] },
  { icon: FileText, label: 'Facturación', path: '/billing', roles: ['partner', 'area_manager', 'finance'] },
  { icon: Settings, label: 'Administración', path: '/admin', roles: ['partner', 'area_manager'] },
]

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800">CRM Legal</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
