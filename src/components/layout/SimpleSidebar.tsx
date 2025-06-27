
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  Clock, 
  Contact,
  Workflow,
  BarChart3,
  Bot
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Contactos',
    href: '/contacts',
    icon: Contact,
  },
  {
    name: 'Expedientes',
    href: '/cases',
    icon: FileText,
  },
  {
    name: 'Tareas',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Time Tracking',
    href: '/time-tracking',
    icon: Clock,
  },
  {
    name: 'Workflows',
    href: '/workflows',
    icon: Workflow,
  },
]

const aiItems = [
  {
    name: 'AI Avanzada',
    href: '/enhanced-advanced-ai',
    icon: Bot,
  },
  {
    name: 'Analytics IA',
    href: '/predictive-analytics',
    icon: BarChart3,
  },
]

export const SimpleSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  console.log('🔧 [SimpleSidebar] Renderizando sidebar simple...')

  return (
    <div className={`
      h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Header */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">CRM Legal</h1>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
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
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`}
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
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className={`flex-shrink-0 h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`}
                  aria-hidden="true"
                />
                {!collapsed && item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
