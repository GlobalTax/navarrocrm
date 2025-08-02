
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Clock, 
  FileText, 
  Users, 
  Calendar,
  DollarSign
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: typeof Plus
  action: () => void
  color: string
}

export const QuickActions = () => {
  const navigate = useNavigate()
  
  const quickActions: QuickAction[] = [
    {
      id: 'new-client',
      title: 'Nuevo Cliente',
      description: 'Registrar cliente',
      icon: Users,
      action: () => navigate('/clients'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'new-case',
      title: 'Nuevo Caso',
      description: 'Crear expediente',
      icon: FileText,
      action: () => navigate('/cases'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'calendar-event',
      title: 'Nuevo Evento',
      description: 'Programar cita',
      icon: Calendar,
      action: () => navigate('/calendar'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'time-entry',
      title: 'Registrar Tiempo',
      description: 'Iniciar timer',
      icon: Clock,
      action: () => navigate('/time-tracking'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'invoice',
      title: 'Factura',
      description: 'Generar factura',
      icon: DollarSign,
      action: () => navigate('/invoices'),
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex items-start gap-3 hover:shadow-md transition-all"
                onClick={action.action}
              >
                <div className={`rounded-lg p-2 text-white ${action.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
