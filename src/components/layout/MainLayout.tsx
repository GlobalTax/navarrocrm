
import { EnhancedHeader } from './EnhancedHeader'
import { Sidebar } from './Sidebar'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { useAIAssistant } from '@/hooks/useAIAssistant'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, isMinimized, toggle, minimize } = useAIAssistant()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <EnhancedHeader />
        <main className="flex-1 responsive-padding py-6 overflow-auto scroll-elegant">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant
        isOpen={isOpen}
        isMinimized={isMinimized}
        onToggle={toggle}
        onMinimize={minimize}
      />
    </div>
  )
}
