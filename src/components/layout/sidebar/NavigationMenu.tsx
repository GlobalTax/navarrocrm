
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { navigation } from './NavigationData'

export const NavigationMenu = () => {
  return (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            cn(
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )
          }
        >
          <item.icon
            className="mr-3 flex-shrink-0 h-6 w-6"
            aria-hidden="true"
          />
          {item.name}
        </NavLink>
      ))}
    </>
  )
}
