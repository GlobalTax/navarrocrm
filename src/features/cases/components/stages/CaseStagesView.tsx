import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface CaseStagesViewProps {
  caseId: string
}

export function CaseStagesView({ caseId }: CaseStagesViewProps) {
  const mockStages = [
    {
      id: '1',
      name: 'Análisis inicial',
      status: 'completed',
      completedAt: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Investigación',
      status: 'in_progress',
      completedAt: null
    },
    {
      id: '3',
      name: 'Redacción documentos',
      status: 'pending',
      completedAt: null
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En progreso</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etapas del Expediente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockStages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
              {getStatusIcon(stage.status)}
              <div className="flex-1">
                <h4 className="font-medium">{stage.name}</h4>
                {stage.completedAt && (
                  <p className="text-sm text-muted-foreground">
                    Completada el {new Date(stage.completedAt).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
              {getStatusBadge(stage.status)}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" size="sm">
            Añadir etapa
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}