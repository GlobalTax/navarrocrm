import React from 'react'
import { Button } from '@/components/ui/button'
import { User, Settings, Bell } from 'lucide-react'

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">CRM Legal Pro</h1>
        <p className="text-sm text-gray-600">Panel de Control</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}