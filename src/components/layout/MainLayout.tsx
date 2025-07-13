
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { OnboardingDialog } from '@/components/onboarding'
import { useAIAssistant } from '@/hooks/useAIAssistant'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import { useLogger } from '@/hooks/useLogger'
import { memo } from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayoutComponent: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, isMinimized, toggle, minimize } = useAIAssistant()
  const logger = useLogger('MainLayout')

  logger.debug('MainLayout render')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
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
      
      {/* Onboarding Dialog */}
      <OnboardingDialog />
      
      {/* Performance Monitor - Solo en desarrollo */}
      {import.meta.env.DEV && <PerformanceMonitor />}
    </div>
  )
}

export const MainLayout = memo(MainLayoutComponent)
