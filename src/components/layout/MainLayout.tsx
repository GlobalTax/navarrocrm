import React from 'react'
import { Header } from './Header'
import { NavigationMenu } from './sidebar/NavigationMenu'
import { QuickActionsSection } from './sidebar/QuickActionsSection'
import { AIAssistantSection } from './sidebar/AIAssistantSection'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900">CRM Legal Pro</h1>
        </div>
        <div className="px-4 pb-4">
          <NavigationMenu />
          <QuickActionsSection />
          <AIAssistantSection />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}