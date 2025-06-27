
import { Header } from './Header'
import { SimpleSidebar } from './SimpleSidebar'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { CacheStatsPanel } from '@/components/dev/CacheStatsPanel'
import { PWASimpleManager } from '@/components/pwa/PWASimpleManager'
import { useAIAssistant } from '@/hooks/useAIAssistant'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  console.log('🔧 [MainLayout] Renderizando layout principal con SimpleSidebar')
  
  const { isOpen, isMinimized, toggle, minimize } = useAIAssistant()

  return (
    <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900">
      {/* Sidebar fijo a la izquierda */}
      <SimpleSidebar />
      
      {/* Contenido principal: Header + Main content */}  
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant
        isOpen={isOpen}
        isMinimized={isMinimized}
        onToggle={toggle}
        onMinimize={minimize}
      />
      
      {/* PWA Simple Manager - Posicionado como overlay */}
      <div className="fixed top-4 right-4 z-50">
        <PWASimpleManager
          showOfflineIndicator={true}
          showSyncNotifications={true}
          showUpdateNotifications={true}
          statusPosition="top-right"
        />
      </div>
      
      {/* Cache Stats Panel - Posicionado como overlay */}
      <div className="fixed bottom-4 left-4 z-50">
        <CacheStatsPanel />
      </div>
    </div>
  )
}
