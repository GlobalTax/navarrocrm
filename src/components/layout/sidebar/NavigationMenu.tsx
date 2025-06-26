
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  Clock, 
  FileBarChart,
  Bot,
  Briefcase,
  Contact,
  Workflow,
  BarChart3,
  UserPlus,
  Calendar
} from 'lucide-react'

interface NavigationMenuProps {
  collapsed?: boolean
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'Contactos',
    href: '/contacts',
    icon: Contact,
    current: false,
  },
  {
    name: 'Expedientes',
    href: '/cases',
    icon: FileText,
    current: false,
  },
  {
    name: 'Tareas',
    href: '/tasks',
    icon: CheckSquare,
    current: false,
  },
  {
    name: 'Propuestas',
    href: '/proposals',
    icon: FileBarChart,
    current: false,
  },
  {
    name: 'Time Tracking',
    href: '/time-tracking',
    icon: Clock,
    current: false,
  },
  {
    name: 'Workflows',
    href: '/workflows',
    icon: Workflow,
    current: false,
  },
]

const aiItems = [
  {
    name: 'AI Avanzada',
    href: '/ai',
    icon: Bot,
    current: false,
  },
  {
    name: 'Analytics IA',
    href: '/predictive-analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Dashboard IA',
    href: '/intelligent-dashboard',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'AI Enhanced',
    href: '/ai-enhanced',
    icon: Bot,
    current: false,
  },
  {
    name: 'AI Admin',
    href: '/ai-admin',
    icon: Bot,
    current: false,
  },
]

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ collapsed = false }) => {
  return (
    <div className="space-y-1">
      {/* Sección Principal */}
      <div className="pb-4">
        {!collapsed && (
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Principal
          </h3>
        )}
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon
              className={cn(
                'flex-shrink-0 h-5 w-5',
                collapsed ? 'mx-auto' : 'mr-3'
              )}
              aria-hidden="true"
            />
            {!collapsed && item.name}
          </NavLink>
        ))}
      </div>

      {/* Sección AI */}
      <div className="pt-4 border-t border-gray-200">
        {!collapsed && (
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Inteligencia Artificial
          </h3>
        )}
        {aiItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon
              className={cn(
                'flex-shrink-0 h-5 w-5',
                collapsed ? 'mx-auto' : 'mr-3'
              )}
              aria-hidden="true"
            />
            {!collapsed && item.name}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
