
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  Lightbulb,
  Brain,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react'
import { PredictiveInsights } from '@/types/analytics'

interface PredictiveInsightsPanelProps {
  insights: PredictiveInsights | null
  isLoading: boolean
  error: string | null
}

export const PredictiveInsightsPanel: React.FC<PredictiveInsightsPanelProps> = ({
  insights,
  isLoading,
  error
}) => {
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error al generar insights</h3>
          <p className="text-red-500 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !insights) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pronóstico de Ingresos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Pronóstico de Ingresos
        </h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Próximo Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  €{insights.revenueForecast.nextMonth.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={insights.revenueForecast.confidence * 100} className="h-2 flex-1" />
                  <span className="text-xs text-gray-600">
                    {(insights.revenueForecast.confidence * 100).toFixed(0)}% confianza
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Próximo Trimestre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-600">
                  €{insights.revenueForecast.nextQuarter.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={insights.revenueForecast.confidence * 90} className="h-2 flex-1" />
                  <span className="text-xs text-gray-600">
                    {(insights.revenueForecast.confidence * 90).toFixed(0)}% confianza
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Próximo Año
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-purple-600">
                  €{insights.revenueForecast.nextYear.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={insights.revenueForecast.confidence * 80} className="h-2 flex-1" />
                  <span className="text-xs text-gray-600">
                    {(insights.revenueForecast.confidence * 80).toFixed(0)}% confianza
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Análisis de Riesgo de Churn */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Análisis de Riesgo de Churn
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clientes en Riesgo</CardTitle>
              <CardDescription>
                {insights.churnRisk.highRiskClients.length} clientes identificados con alto riesgo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.churnRisk.highRiskClients.slice(0, 5).map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{client.name}</h4>
                    <p className="text-sm text-gray-600">
                      {client.lastActivityDays} días sin actividad
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={client.riskScore > 0.8 ? "destructive" : client.riskScore > 0.6 ? "default" : "secondary"}
                    >
                      {(client.riskScore * 100).toFixed(0)}% riesgo
                    </Badge>
                  </div>
                </div>
              ))}
              
              {insights.churnRisk.highRiskClients.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  +{insights.churnRisk.highRiskClients.length - 5} clientes más...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estrategias de Mitigación</CardTitle>
              <CardDescription>Acciones recomendadas para reducir el churn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.churnRisk.mitigationStrategies.map((strategy, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{strategy}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Oportunidades de Crecimiento */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Oportunidades de Crecimiento
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cross-Sell y Up-Sell</CardTitle>
              <CardDescription>
                {insights.opportunityInsights.upSellPotential}% de potencial de crecimiento identificado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Oportunidades de Cross-Sell:</h4>
                <div className="space-y-2">
                  {insights.opportunityInsights.crossSellOpportunities.slice(0, 3).map((opportunity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-green-600" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Potencial de Up-Sell</span>
                  <Badge variant="secondary">
                    {insights.opportunityInsights.upSellPotential}%
                  </Badge>
                </div>
                <Progress value={insights.opportunityInsights.upSellPotential} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendencias de Mercado</CardTitle>
              <CardDescription>Insights sobre el mercado legal actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.opportunityInsights.marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{trend}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Optimización de Recursos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Optimización de Recursos
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recomendaciones de Personal</CardTitle>
              <CardDescription>
                Se recomienda {insights.resourceOptimization.recommendedStaffing} personas para el equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-3xl font-bold text-indigo-600">
                  {insights.resourceOptimization.recommendedStaffing}
                </p>
                <p className="text-sm text-indigo-600">Personal recomendado</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Distribución de Carga:</h4>
                <div className="space-y-2">
                  {insights.resourceOptimization.workloadDistribution.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Clock className="h-3 w-3 text-indigo-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gaps de Eficiencia</CardTitle>
              <CardDescription>Áreas identificadas para mejora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.resourceOptimization.efficiencyGaps.map((gap, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {gap}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
