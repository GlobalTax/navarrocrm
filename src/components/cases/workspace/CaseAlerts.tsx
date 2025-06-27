
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Euro, FileText, Calendar, CheckCircle2 } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseAlertsProps {
  case_: Case
}

interface AlertItem {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  category: 'budget' | 'deadline' | 'task' | 'document' | 'communication'
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  date: string
}

export function CaseAlerts({ case_ }: CaseAlertsProps) {
  const alerts: AlertItem[] = [
    {
      id: '1',
      type: 'warning',
      category: 'budget',
      title: 'Presupuesto al 80%',
      description: 'El expediente ha utilizado el 80% del presupuesto estimado. Revisar gastos y tiempo restante.',
      action: 'Ver detalles financieros',
      priority: 'high',
      date: '2024-01-22'
    },
    {
      id: '2',
      type: 'error',
      category: 'deadline',
      title: 'Plazo próximo a vencer',
      description: 'La tarea "Preparar documentación probatoria" vence en 2 días.',
      action: 'Ver tarea',
      priority: 'high',
      date: '2024-01-23'
    },
    {
      id: '3',
      type: 'info',
      category: 'communication',
      title: 'Respuesta pendiente',
      description: 'Email del cliente sin responder desde hace 3 días.',
      action: 'Responder email',
      priority: 'medium',
      date: '2024-01-20'
    },
    {
      id: '4',
      type: 'success',
      category: 'task',
      title: 'Fase completada',
      description: 'La fase de "Investigación y Análisis" se ha completado exitosamente.',
      priority: 'low',
      date: '2024-01-18'
    }
  ]

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'budget':
        return <Euro className="h-4 w-4" />
      case 'deadline':
        return <Clock className="h-4 w-4" />
      case 'task':
        return <CheckCircle2 className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'communication':
        return <Calendar className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Media'
      case 'low':
        return 'Baja'
      default:
        return priority
    }
  }

  const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high')
  const otherAlerts = alerts.filter(alert => alert.priority !== 'high')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas y Notificaciones
          </div>
          <Badge variant="outline">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alertas de alta prioridad */}
        {highPriorityAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Requieren Atención Inmediata
            </h4>
            {highPriorityAlerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.type)}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.category)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{alert.title}</h5>
                        <AlertDescription className="text-sm">
                          {alert.description}
                        </AlertDescription>
                      </div>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {getPriorityLabel(alert.priority)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-75">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                      {alert.action && (
                        <Button variant="outline" size="sm" className="text-xs">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Otras alertas */}
        {otherAlerts.length > 0 && (
          <div className="space-y-3">
            {highPriorityAlerts.length > 0 && (
              <h4 className="font-medium text-gray-700 flex items-center gap-2 pt-4 border-t">
                Otras Notificaciones
              </h4>
            )}
            {otherAlerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.type)}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.category)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{alert.title}</h5>
                        <AlertDescription className="text-sm">
                          {alert.description}
                        </AlertDescription>
                      </div>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {getPriorityLabel(alert.priority)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-75">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                      {alert.action && (
                        <Button variant="outline" size="sm" className="text-xs">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>¡Excelente! No hay alertas pendientes.</p>
            <p className="text-sm">El expediente está funcionando sin problemas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
