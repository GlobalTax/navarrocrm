
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { useAIAssistant } from '@/hooks/useAIAssistant'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, isMinimized, toggle, minimize, close } = useAIAssistant()

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* AI Assistant - botón fijo en esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-50">
        <AIAssistant
          isOpen={isOpen}
          isMinimized={isMinimized}
          onToggle={toggle}
          onMinimize={minimize}
        />
      </div>
    </div>
  )
}
