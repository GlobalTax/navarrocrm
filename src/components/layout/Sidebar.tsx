
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  FileText,
  Calendar,
  Clock,
  Settings,
  ChevronDown,
  MessageSquare
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Casos', href: '/cases', icon: FolderOpen },
  { name: 'Propuestas', href: '/proposals', icon: FileText },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Registro de Tiempo', href: '/time-tracking', icon: Clock },
]

export function Sidebar() {
  const [isAIOpen, setIsAIOpen] = useState(false)

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">LegalCRM</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )
              }
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-6 w-6"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
          
          <Collapsible open={isAIOpen} onOpenChange={setIsAIOpen}>
            <CollapsibleTrigger className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <MessageSquare className="mr-3 flex-shrink-0 h-6 w-6" />
              Asistente IA
              <ChevronDown className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isAIOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-6">
              <NavLink
                to="/ai-admin"
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )
                }
              >
                Administración IA
              </NavLink>
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>
    </div>
  )
}
