
import React from 'react'
import { useGlobalSidebar } from '@/hooks/useGlobalStateSelectors'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { NavigationMenu } from './sidebar/NavigationMenu'
import { QuickActionsSection } from './sidebar/QuickActionsSection'
import { AIAssistantSection } from './sidebar/AIAssistantSection'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const CollapsibleSidebarContent = React.memo(() => {
  console.log('🔧 [CollapsibleSidebar] Renderizando sidebar...')
  
  const { sidebarCollapsed, toggleSidebar } = useGlobalSidebar()
  
  console.log('🔧 [CollapsibleSidebar] Estado del sidebar:', { 
    sidebarCollapsed, 
    toggleSidebarAvailable: !!toggleSidebar 
  })

  return (
    <div className={`
      flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
      ${sidebarCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 flex-col pt-2 pb-4 overflow-y-auto">
        <SidebarHeader collapsed={sidebarCollapsed} />
        
        <nav className="flex-1 px-2 space-y-1">
          <NavigationMenu collapsed={sidebarCollapsed} />
          {!sidebarCollapsed && (
            <>
              <QuickActionsSection />
              <AIAssistantSection />
            </>
          )}
        </nav>
      </div>
    </div>
  )
})

CollapsibleSidebarContent.displayName = 'CollapsibleSidebarContent'

export const CollapsibleSidebar = React.memo(() => {
  console.log('🔧 [CollapsibleSidebar] Montando componente principal')
  
  return (
    <ErrorBoundary fallback={
      <div className="w-16 h-full bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-xs text-gray-500">Cargando menú...</div>
      </div>
    }>
      <CollapsibleSidebarContent />
    </ErrorBoundary>
  )
})

CollapsibleSidebar.displayName = 'CollapsibleSidebar'
