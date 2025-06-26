
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Target,
  Lightbulb,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react'
import { AIAnalytics, AIRecommendation } from '@/types/aiTypes'

interface AIAnalyticsPanelProps {
  analytics: AIAnalytics | null
  recommendations: AIRecommendation[]
  isLoading: boolean
  onRefresh: () => void
}

export const AIAnalyticsPanel: React.FC<AIAnalyticsPanelProps> = ({
  analytics,
  recommendations,
  isLoading,
  onRefresh
}) => {
  if (!analytics && !isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Analytics no disponibles
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            Genera un reporte de analytics para obtener insights sobre tu uso de herramientas IA.
          </p>
          <Button onClick={onRefresh}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generar Analytics
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'tool': return <Zap className="h-4 w-4" />
      case 'workflow': return <Target className="h-4 w-4" />
      case 'optimization': return <TrendingUp className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avanzados</h2>
          <p className="text-gray-600">Insights inteligentes sobre tu productividad con IA</p>
        </div>
        <Button onClick={onRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Generando...' : 'Actualizar'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
      ) : analytics ? (
        <>
          {/* Métricas principales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Uso Total</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.totalUsage}</p>
                    <p className="text-xs text-gray-500 mt-1">Ejecuciones de herramientas</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Éxito</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(analytics.successRate * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Promedio general</p>
                  </div>
                  <Award className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Eficiencia</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round(analytics.userEfficiency * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Productividad del usuario</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Ahorrado</p>
                    <p className="text-3xl font-bold text-orange-600">{analytics.timeScheduled}h</p>
                    <p className="text-xs text-gray-500 mt-1">Este mes</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Herramientas más usadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Herramientas Más Utilizadas
              </CardTitle>
              <CardDescription>
                Ranking de herramientas por número de usos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.mostUsedTools.slice(0, 5).map((tool, index) => (
                  <div key={tool.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{tool.name}</h4>
                        <span className="text-sm text-gray-600">{tool.usageCount} usos</span>
                      </div>
                      <Progress 
                        value={(tool.usageCount / analytics.mostUsedTools[0]?.usageCount) * 100} 
                        className="h-2"
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(tool.successRate * 100)}% éxito
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendencias semanales */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Uso</CardTitle>
                <CardDescription>Evolución semanal del uso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.weeklyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.week}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <Progress value={(trend.usage / 100) * 100} className="h-2" />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {trend.usage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
                <CardDescription>Uso por tipo de herramienta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.categoryBreakdown.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.tools} herramientas
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <Progress 
                            value={(category.usage / Math.max(...analytics.categoryBreakdown.map(c => c.usage))) * 100} 
                            className="h-2" 
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {category.usage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones inteligentes */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Recomendaciones Inteligentes
                </CardTitle>
                <CardDescription>
                  Sugerencias personalizadas para mejorar tu productividad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getConfidenceColor(rec.confidence)}`}
                            >
                              {Math.round(rec.confidence * 100)}% confianza
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>💡 {rec.estimatedBenefit}</span>
                            <span>🎯 {rec.actionRequired}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
