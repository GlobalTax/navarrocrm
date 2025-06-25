
import { Header } from './Header'
import { CollapsibleSidebar } from './CollapsibleSidebar'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { CacheStatsPanel } from '@/components/dev/CacheStatsPanel'
import { PWAStatusManager } from '@/components/pwa/PWAStatusManager'
import { useAIAssistant } from '@/hooks/useAIAssistant'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, isMinimized, toggle, minimize } = useAIAssistant()

  return (
    <div className="min-h-screen bg-gray-50 flex dark:bg-gray-900">
      <CollapsibleSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
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
      
      {/* PWA Status Manager - Unified PWA functionality */}
      <PWAStatusManager
        showInstallPrompt={true}
        showOfflineStatus={true}
        showUpdatePrompt={true}
      />
      
      {/* Cache Stats Panel (Development Only) */}
      <CacheStatsPanel />
    </div>
  )
}
