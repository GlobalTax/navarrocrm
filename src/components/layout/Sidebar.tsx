
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { 
  Home, 
  UserCheck, 
  Scale, 
  ScrollText,
  Calendar,
  Timer,
  Settings,
  ChevronDown,
  Bot,
  Zap,
  UserPlus,
  FolderPlus,
  CalendarPlus,
  PlayCircle,
  Receipt,
  Sparkles
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAIAssistant } from '@/hooks/useAIAssistant'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/clients', icon: UserCheck },
  { name: 'Casos', href: '/cases', icon: Scale },
  { name: 'Propuestas', href: '/proposals', icon: ScrollText },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Registro de Tiempo', href: '/time-tracking', icon: Timer },
]

export function Sidebar() {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true)
  const navigate = useNavigate()
  const { toggle: toggleAI } = useAIAssistant()

  const quickActions = [
    {
      id: 'new-client',
      title: 'Nuevo Cliente',
      icon: UserPlus,
      action: () => navigate('/clients'),
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      id: 'new-case',
      title: 'Nuevo Caso',
      icon: FolderPlus,
      action: () => navigate('/cases'),
      color: 'text-green-600 hover:text-green-700'
    },
    {
      id: 'calendar-event',
      title: 'Nuevo Evento',
      icon: CalendarPlus,
      action: () => navigate('/calendar'),
      color: 'text-purple-600 hover:text-purple-700'
    },
    {
      id: 'time-entry',
      title: 'Registrar Tiempo',
      icon: PlayCircle,
      action: () => navigate('/time-tracking'),
      color: 'text-orange-600 hover:text-orange-700'
    },
    {
      id: 'invoice',
      title: 'Nueva Factura',
      icon: Receipt,
      action: () => {}, // TODO: Implementar facturación
      color: 'text-indigo-600 hover:text-indigo-700'
    }
  ]

  const aiQuickActions = [
    {
      id: 'ai-create-client',
      title: 'Crear cliente con IA',
      icon: UserCheck,
      prompt: 'Ayúdame a crear un nuevo cliente paso a paso'
    },
    {
      id: 'ai-search-case',
      title: 'Buscar expediente',
      icon: Scale,
      prompt: 'Quiero buscar información sobre un expediente específico'
    },
    {
      id: 'ai-schedule',
      title: 'Agendar cita',
      icon: Calendar,
      prompt: 'Necesito programar una cita con un cliente'
    }
  ]

  const handleAIAction = (prompt: string) => {
    // TODO: Integrar con el sistema de chat del AI Assistant
    toggleAI()
    console.log('AI Action:', prompt)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">LegalCRM</h1>
        </div>
        
        <nav className="flex-1 px-2 space-y-1">
          {/* Navegación principal */}
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
          
          {/* Acciones Rápidas */}
          <Collapsible open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
            <CollapsibleTrigger className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-4">
              <Zap className="mr-3 flex-shrink-0 h-6 w-6" />
              Acciones Rápidas
              <ChevronDown className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isQuickActionsOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-6">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    onClick={action.action}
                    className={cn(
                      "w-full justify-start px-2 py-1.5 h-auto text-sm font-normal",
                      action.color
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.title}
                  </Button>
                )
              })}
              
              {/* Separador para acciones de IA */}
              <div className="border-t border-gray-200 my-2" />
              <div className="text-xs text-gray-500 px-2 py-1 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Con IA
              </div>
              
              {aiQuickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAIAction(action.prompt)}
                    className="w-full justify-start px-2 py-1.5 h-auto text-sm font-normal text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.title}
                  </Button>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Asistente IA */}
          <Collapsible open={isAIOpen} onOpenChange={setIsAIOpen}>
            <CollapsibleTrigger className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <Bot className="mr-3 flex-shrink-0 h-6 w-6" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAI}
                className="w-full justify-start px-2 py-1.5 h-auto text-sm font-normal text-gray-600 hover:text-gray-900"
              >
                <Bot className="mr-2 h-4 w-4" />
                Abrir Chat IA
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>
    </div>
  )
}
