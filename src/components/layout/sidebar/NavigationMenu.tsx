
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { NAVIGATION_DATA } from './NavigationData'
import { useRecurringFeesOverdue } from '@/hooks/useRecurringFeesOverdue'
import { memo } from 'react'

const NavigationMenuComponent = () => {
  const { data: overdueCount = 0 } = useRecurringFeesOverdue()

  return (
    <div className="space-y-4">
      {NAVIGATION_DATA.map((section) => (
        <div key={section.title} className="space-y-1">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const showOverdueBadge = item.url === '/recurring-fees' && overdueCount > 0
              
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )
                  }
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                  {showOverdueBadge && (
                    <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                      {overdueCount}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Memoización de navegación para prevenir re-renders innecesarios
export const NavigationMenu = memo(NavigationMenuComponent, (prevProps, nextProps) => {
  // Al no tener props externas, solo depende de overdueCount interno
  // El hook useRecurringFeesOverdue maneja su propio cache
  return false // Siempre re-renderizar para capturar cambios en overdueCount
})

NavigationMenu.displayName = 'NavigationMenu'
