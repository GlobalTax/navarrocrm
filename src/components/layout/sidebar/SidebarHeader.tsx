
import React from 'react'
import { Building2 } from 'lucide-react'

interface SidebarHeaderProps {
  collapsed?: boolean
}

export function SidebarHeader({ collapsed = false }: SidebarHeaderProps) {
  return (
    <div className="flex items-center px-4 py-2">
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">CRM Legal</p>
            <p className="text-xs text-gray-500">Sistema Integral</p>
          </div>
        )}
      </div>
    </div>
  )
}
