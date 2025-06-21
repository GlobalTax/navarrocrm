
import { Button } from '@/components/ui/button'
import { Users, FileText, Calendar } from 'lucide-react'
import { QuickAction } from './types'

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Users,
    label: 'Crear cliente',
    prompt: 'Ayúdame a crear un nuevo cliente paso a paso'
  },
  {
    icon: FileText,
    label: 'Buscar expediente',
    prompt: 'Quiero buscar información sobre un expediente específico'
  },
  {
    icon: Calendar,
    label: 'Agendar cita',
    prompt: 'Necesito programar una cita con un cliente'
  }
]

interface QuickActionsProps {
  onActionClick: (prompt: string) => void
  isLoading: boolean
}

export const QuickActions = ({ onActionClick, isLoading }: QuickActionsProps) => {
  return (
    <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <p className="text-xs text-blue-700 mb-2 font-medium">🚀 Acciones rápidas:</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => onActionClick(action.prompt)}
            className="text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            disabled={isLoading}
          >
            <action.icon className="h-3 w-3 mr-1" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
