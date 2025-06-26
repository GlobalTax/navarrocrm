
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign, 
  Users, 
  Clock, 
  Target,
  BarChart3
} from 'lucide-react'
import { AnalyticsMetrics } from '@/types/analytics'

interface AnalyticsMetricsOverviewProps {
  metrics: AnalyticsMetrics | null
  isLoading: boolean
  error: string | null
}

export const AnalyticsMetricsOverview: React.FC<AnalyticsMetricsOverviewProps> = ({
  metrics,
  isLoading,
  error
}) => {
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar métricas</h3>
          <p className="text-red-500 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !metrics) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Ingresos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Métricas de Ingresos
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ingresos Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">€{metrics.revenue.current.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metrics.revenue.growth)}
                  <span className={`text-sm ${getTrendColor(metrics.revenue.growth)}`}>
                    {Math.abs(metrics.revenue.growth).toFixed(1)}% vs anterior
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">MRR</CardTitle>
              <CardDescription>Monthly Recurring Revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">€{metrics.revenue.mrr.toLocaleString()}</p>
              <p className="text-sm text-gray-600">ARR: €{metrics.revenue.arr.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tasa de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.cases.conversionRate.toFixed(1)}%
                </p>
                <Progress value={metrics.cases.conversionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Valor Lifetime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                €{metrics.clients.lifetimeValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Promedio por cliente</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas de Casos y Clientes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Casos y Clientes
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Distribución de Casos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Activos</span>
                  <span className="font-medium">{metrics.cases.active}</span>
                </div>
                <Progress 
                  value={(metrics.cases.active / metrics.cases.total) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cerrados</span>
                  <span className="font-medium">{metrics.cases.closed}</span>
                </div>
                <Progress 
                  value={(metrics.cases.closed / metrics.cases.total) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span>{metrics.cases.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{metrics.clients.total}</p>
                <p className="text-sm text-gray-600">Total de clientes</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  +{metrics.clients.new} nuevos este mes
                </Badge>
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Churn rate: </span>
                <span className={`font-medium ${metrics.clients.churnRate < 5 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.clients.churnRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tiempo Promedio por Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-indigo-600">
                  {metrics.productivity.averageCaseTime.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">días promedio</p>
                
                {metrics.productivity.averageCaseTime > 30 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Por encima del promedio
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas de Productividad */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Productividad y Rendimiento
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Horas Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{metrics.productivity.hoursTracked.toFixed(1)}h</p>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">
                    {metrics.productivity.billableHours.toFixed(1)}h
                  </span>
                  <span> facturables</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tasa de Utilización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.productivity.utilizationRate.toFixed(1)}%
                </p>
                <Progress value={metrics.productivity.utilizationRate} className="h-2" />
                {metrics.productivity.utilizationRate < 70 && (
                  <p className="text-xs text-orange-600">Oportunidad de mejora</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Finalización de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  {metrics.performance.taskCompletionRate.toFixed(1)}%
                </p>
                <Progress value={metrics.performance.taskCompletionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eficiencia del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.performance.teamEfficiency}%
                </p>
                <div className="text-sm">
                  <p className="text-gray-600">
                    Tiempo respuesta: {metrics.performance.averageResponseTime}h
                  </p>
                  <p className="text-gray-600">
                    Satisfacción: {metrics.performance.clientSatisfaction}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
