
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign, 
  Clock,
  Lightbulb,
  RefreshCw,
  BarChart3,
  Brain,
  Zap
} from 'lucide-react'
import { useAdvancedAnalytics } from '@/hooks/analytics/useAdvancedAnalytics'
import { AnalyticsMetricsOverview } from './AnalyticsMetricsOverview'
import { PredictiveInsightsPanel } from './PredictiveInsightsPanel'
import { CustomReportsPanel } from './CustomReportsPanel'

export const PredictiveAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const {
    metrics,
    insights,
    customReports,
    isLoading,
    isLoadingMetrics,
    isLoadingInsights,
    metricsError,
    insightsError,
    refreshAll,
    hasData
  } = useAdvancedAnalytics()

  const handleRefresh = async () => {
    await refreshAll()
  }

  if (!hasData() && !isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Analytics Predictivo
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Cargando datos para generar insights predictivos y métricas avanzadas...
            </p>
            <Button onClick={handleRefresh} disabled={isLoading}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Cargar Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Analytics Predictivo
          </h1>
          <p className="text-gray-600 mt-1">
            Insights inteligentes y análisis avanzado para optimizar tu despacho
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Indicadores de estado */}
          <div className="flex items-center gap-2">
            {isLoadingMetrics && (
              <Badge variant="secondary" className="animate-pulse">
                <BarChart3 className="h-3 w-3 mr-1" />
                Cargando métricas...
              </Badge>
            )}
            {isLoadingInsights && (
              <Badge variant="secondary" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Generando insights...
              </Badge>
            )}
            {metricsError && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Error en métricas
              </Badge>
            )}
            {insightsError && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Error en insights
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Resumen rápido de KPIs principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Actuales</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{metrics.revenue.current.toLocaleString()}
                  </p>
                  {metrics.revenue.growth !== 0 && (
                    <p className={`text-xs ${metrics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.revenue.growth >= 0 ? '+' : ''}{metrics.revenue.growth.toFixed(1)}% vs mes anterior
                    </p>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Casos Activos</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.cases.active}</p>
                  <p className="text-xs text-gray-500">
                    {metrics.cases.total} casos totales
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilización</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.productivity.utilizationRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {metrics.productivity.billableHours.toFixed(1)}h facturables
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Nuevos</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.clients.new}</p>
                  <p className="text-xs text-gray-500">
                    {metrics.clients.total} clientes totales
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Métricas Generales
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights Predictivos
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Reportes Personalizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsMetricsOverview 
            metrics={metrics} 
            isLoading={isLoadingMetrics}
            error={metricsError}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <PredictiveInsightsPanel 
            insights={insights}
            isLoading={isLoadingInsights}
            error={insightsError}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <CustomReportsPanel 
            reports={customReports}
            onCreateReport={() => {/* TODO: Implementar */}}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
