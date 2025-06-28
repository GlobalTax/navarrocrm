
import React from 'react'
import { useGlobalSidebar } from '@/hooks/useGlobalStateSelectors'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { NavigationMenu } from './sidebar/NavigationMenu'
import { QuickActionsSection } from './sidebar/QuickActionsSection'
import { AIAssistantSection } from './sidebar/AIAssistantSection'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Componente de fallback para cuando hay errores
const SidebarFallback = ({ collapsed }: { collapsed: boolean }) => (
  <div className={`
    flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
    ${collapsed ? 'w-16' : 'w-64'}
  `}>
    <div className="flex items-center justify-center p-4">
      <Menu className="h-6 w-6 text-gray-400" />
    </div>
    <div className="flex-1 px-2">
      <div className="text-center text-sm text-gray-500 mt-8">
        {collapsed ? '...' : 'Cargando menú...'}
      </div>
    </div>
  </div>
)

const CollapsibleSidebarContent = React.memo(() => {
  const { sidebarCollapsed, toggleSidebar } = useGlobalSidebar()

  console.log('🔧 [CollapsibleSidebar] Rendering with collapsed:', sidebarCollapsed)

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
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 flex-col pt-2 pb-4 overflow-y-auto">
        <ErrorBoundary fallback={<div className="p-4 text-xs text-gray-500">Error en header</div>}>
          <SidebarHeader collapsed={sidebarCollapsed} />
        </ErrorBoundary>
        
        <nav className="flex-1 px-2 space-y-1">
          <ErrorBoundary fallback={<div className="p-4 text-xs text-gray-500">Error en navegación</div>}>
            <NavigationMenu collapsed={sidebarCollapsed} />
          </ErrorBoundary>
          
          {!sidebarCollapsed && (
            <ErrorBoundary fallback={<div className="p-4 text-xs text-gray-500">Error en acciones</div>}>
              <>
                <QuickActionsSection />
                <AIAssistantSection />
              </>
            </ErrorBoundary>
          )}
        </nav>
      </div>
    </div>
  )
})

CollapsibleSidebarContent.displayName = 'CollapsibleSidebarContent'

export const CollapsibleSidebar = React.memo(() => {
  return (
    <ErrorBoundary 
      fallback={<SidebarFallback collapsed={false} />}
      onError={(error) => {
        console.error('🚨 [CollapsibleSidebar] Error crítico:', error)
      }}
    >
      <CollapsibleSidebarContent />
    </ErrorBoundary>
  )
})

CollapsibleSidebar.displayName = 'CollapsibleSidebar'
