
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Zap, Target, Users } from 'lucide-react'

interface WorkflowMetrics {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  timeSaved: number
  activeWorkflows: number
  topPerformingWorkflow: string
  improvementSuggestions: string[]
}

interface WorkflowMetricsDashboardProps {
  metrics: WorkflowMetrics
  isLoading?: boolean
}

export function WorkflowMetricsDashboard({ metrics, isLoading }: WorkflowMetricsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const successRate = metrics.totalExecutions > 0 
    ? Math.round((metrics.successfulExecutions / metrics.totalExecutions) * 100) 
    : 0

  const stats = [
    {
      title: 'Workflows Activos',
      value: metrics.activeWorkflows.toString(),
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Automatizaciones en funcionamiento'
    },
    {
      title: 'Ejecuciones Totales',
      value: metrics.totalExecutions.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Este mes'
    },
    {
      title: 'Tasa de Éxito',
      value: `${successRate}%`,
      icon: successRate >= 95 ? CheckCircle : successRate >= 80 ? Clock : XCircle,
      color: successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600',
      bgColor: successRate >= 95 ? 'bg-green-50' : successRate >= 80 ? 'bg-yellow-50' : 'bg-red-50',
      description: `${metrics.successfulExecutions} exitosas de ${metrics.totalExecutions}`
    },
    {
      title: 'Tiempo Ahorrado',
      value: `${Math.round(metrics.timeSaved / 60)}h`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Automatización vs manual'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} ml-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Rendimiento General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tasa de Éxito</span>
                <span className="text-sm text-muted-foreground">{successRate}%</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tiempo Promedio</span>
                <span className="text-sm text-muted-foreground">{metrics.averageExecutionTime}s</span>
              </div>
              <Progress value={Math.min((5000 - metrics.averageExecutionTime) / 50, 100)} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Mejor Workflow:</p>
              <Badge variant="outline" className="text-xs">
                {metrics.topPerformingWorkflow || 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Sugerencias de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.improvementSuggestions.length > 0 ? (
              <ul className="space-y-3">
                {metrics.improvementSuggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  ¡Excelente! Tus workflows están funcionando de manera óptima.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
