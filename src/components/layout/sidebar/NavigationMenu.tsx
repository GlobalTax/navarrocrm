
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getNavigationItems } from './NavigationData'
import { useApp } from '@/contexts/AppContext'

interface NavigationMenuProps {
  collapsed?: boolean
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ collapsed = false }) => {
  const { user } = useApp()
  const navigationItems = getNavigationItems(user?.role)

  return (
    <div className="space-y-1">
      {Object.entries(
        navigationItems.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = []
          }
          acc[item.category].push(item)
          return acc
        }, {} as Record<string, typeof navigationItems>)
      ).map(([category, items]) => (
        <div key={category} className="pb-4">
          {!collapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {category === 'main' ? 'Principal' :
               category === 'business' ? 'Negocio' :
               category === 'productivity' ? 'Productividad' :
               category === 'analytics' ? 'Analíticas' :
               category === 'admin' ? 'Administración' :
               category === 'ai' ? 'Inteligencia Artificial' : category}
            </h3>
          )}
          {items.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
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
              {!collapsed && item.title}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  )
}
