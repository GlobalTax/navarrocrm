
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { useAIAssistant } from '@/hooks/useAIAssistant'

export const MainLayout: React.FC = () => {
  const { isOpen, isMinimized, toggle, minimize } = useAIAssistant()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* AI Assistant with new modern interface */}
      <AIAssistant
        isOpen={isOpen}
        isMinimized={isMinimized}
        onToggle={toggle}
        onMinimize={minimize}
      />
    </div>
  )
}
