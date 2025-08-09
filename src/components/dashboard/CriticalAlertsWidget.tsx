import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Euro, FileX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'deadline' | 'payment' | 'overdue' | 'budget'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  daysLeft?: number
  amount?: number
}

interface CriticalAlertsWidgetProps {
  alerts: Alert[]
  isLoading?: boolean
}

export const CriticalAlertsWidget = ({ alerts, isLoading }: CriticalAlertsWidgetProps) => {
  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">Alertas Críticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high').slice(0, 5)

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'deadline':
        return Clock
      case 'payment':
        return Euro
      case 'overdue':
        return AlertTriangle
      case 'budget':
        return FileX
      default:
        return AlertTriangle
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'low':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px] hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">Alertas Críticas</CardTitle>
          {highPriorityAlerts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {highPriorityAlerts.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {highPriorityAlerts.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Sin alertas críticas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {highPriorityAlerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type)
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border border-0.5 transition-colors cursor-pointer hover:bg-gray-50",
                    getSeverityColor(alert.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {alert.description}
                      </p>
                      {alert.daysLeft !== undefined && (
                        <p className="text-xs font-medium mt-1">
                          {alert.daysLeft > 0 ? `${alert.daysLeft} días restantes` : 'Vencido'}
                        </p>
                      )}
                      {alert.amount && (
                        <p className="text-xs font-medium mt-1">
                          {new Intl.NumberFormat('es-ES', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(alert.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}