
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navigationData } from './NavigationData'

interface NavigationMenuProps {
  collapsed?: boolean
}

export function NavigationMenu({ collapsed = false }: NavigationMenuProps) {
  const location = useLocation()

  return (
    <div className="space-y-1">
      {navigationData.map((section, sectionIndex) => (
        <div key={section.title || sectionIndex} className="space-y-1">
          {!collapsed && section.title && (
            <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
          )}
          {section.items.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/' && location.pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`flex-shrink-0 h-5 w-5 ${collapsed ? '' : 'mr-3'}`}
                  aria-hidden="true"
                />
                {!collapsed && item.name}
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}
