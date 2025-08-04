
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { navigationData } from './NavigationData'
import { useRecurringFeesOverdue } from '@/features/billing'

export const NavigationMenu = () => {
  const { data: overdueCount = 0 } = useRecurringFeesOverdue()

  return (
    <div className="space-y-4">
      {navigationData.map((section) => (
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
