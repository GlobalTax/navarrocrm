
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export const QuickActionsSection = () => {
  const navigate = useNavigate()

  const quickActions = [
    {
      name: "Nuevo Cliente",
      href: "/contacts",
      action: () => navigate('/contacts')
    },
    {
      name: "Nuevo Caso",
      href: "/cases",
      action: () => navigate('/cases')
    },
    {
      name: "Nueva Propuesta",
      href: "/proposals",
      action: () => navigate('/proposals')
    }
  ]

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Acciones Rápidas
      </h3>
      <div className="space-y-1">
        {quickActions.map((action) => (
          <Button
            key={action.name}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={action.action}
          >
            <Plus className="mr-3 h-4 w-4" />
            {action.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
