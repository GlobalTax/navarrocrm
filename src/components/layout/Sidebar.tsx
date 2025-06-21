
import { SidebarHeader } from './sidebar/SidebarHeader'
import { NavigationMenu } from './sidebar/NavigationMenu'
import { AIAssistantSection } from './sidebar/AIAssistantSection'

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <SidebarHeader />
        
        <nav className="flex-1 px-2 space-y-1">
          <NavigationMenu />
          <AIAssistantSection />
        </nav>
      </div>
    </div>
  )
}
