
import React from 'react'
import { useApp } from '@/contexts/AppContext'

interface SidebarHeaderProps {
  collapsed?: boolean
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed = false }) => {
  const { user } = useApp()

  if (collapsed) {
    return (
      <div className="flex items-center justify-center px-2 py-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CRM</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center px-4 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">CRM</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">
            Legal CRM
          </h1>
          {user?.email && (
            <p className="text-xs text-gray-500 truncate max-w-[140px]">
              {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
