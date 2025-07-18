import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Upload, 
  Bot, 
  FileText, 
  MessageCircle, 
  Gavel,
  Zap,
  Sparkles
} from 'lucide-react'

interface QuickActionsProps {
  onCreateTemplate: () => void
}

export const QuickActions = ({ onCreateTemplate }: QuickActionsProps) => {
  const actions = [
    {
      title: 'Crear Plantilla',
      description: 'Nueva plantilla desde cero',
      icon: Plus,
      color: 'bg-primary text-primary-foreground hover:bg-primary/90',
      onClick: onCreateTemplate
    },
    {
      title: 'Contrato',
      description: 'Plantilla de contrato',
      icon: FileText,
      color: 'bg-blue-600 text-white hover:bg-blue-700',
      onClick: () => {}
    },
    {
      title: 'Comunicación',
      description: 'Carta o email',
      icon: MessageCircle,
      color: 'bg-green-600 text-white hover:bg-green-700',
      onClick: () => {}
    },
    {
      title: 'Documento Procesal',
      description: 'Demanda, escrito...',
      icon: Gavel,
      color: 'bg-purple-600 text-white hover:bg-purple-700',
      onClick: () => {}
    },
    {
      title: 'Con IA',
      description: 'Generar con asistente',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700',
      onClick: () => {}
    },
    {
      title: 'Importar',
      description: 'Desde archivo existente',
      icon: Upload,
      color: 'bg-orange-600 text-white hover:bg-orange-700',
      onClick: () => {}
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${action.color} border border-muted hover:shadow-md transition-all duration-200`}
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}