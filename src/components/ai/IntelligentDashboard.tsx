
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign, 
  Clock,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { useIntelligentAnalytics } from '@/hooks/useIntelligentAnalytics'

export const IntelligentDashboard = () => {
  const { insights, metrics, isLoading, refreshInsights } = useIntelligentAnalytics()

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Target className="h-4 w-4" />
      case 'low': return <Lightbulb className="h-4 w-4" />
      default: return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Dashboard Inteligente
          </h2>
          <p className="text-gray-600">
            Insights predictivos y análisis avanzado para tu despacho
          </p>
        </div>
        <Button onClick={refreshInsights} disabled={isLoading}>
          {isLoading ? 'Analizando...' : 'Actualizar Insights'}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights Predictivos</TabsTrigger>
          <TabsTrigger value="metrics">Métricas de Rendimiento</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight) => (
              <Card key={insight.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getImpactIcon(insight.impact)}
                        {insight.title}
                      </CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <Badge variant={getImpactColor(insight.impact)}>
                      {insight.impact.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Nivel de Confianza</span>
                      <span>{Math.round(insight.confidence * 100)}%</span>
                    </div>
                    <Progress value={insight.confidence * 100} className="h-2" />
                  </div>
                  
                  {insight.actionable && insight.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Acciones Recomendadas:</h4>
                      <ul className="text-sm space-y-1">
                        {insight.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {insights.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Generando Insights...
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  El sistema está analizando tus datos para generar insights predictivos. 
                  Esto puede tomar unos momentos la primera vez.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {metric.metric.includes('Ingresos') 
                          ? `€${metric.current.toLocaleString()}`
                          : metric.current.toLocaleString()
                        }
                      </span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {Math.abs(metric.percentage_change).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {metric.target && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Objetivo</span>
                          <span>
                            {metric.metric.includes('Ingresos') 
                              ? `€${metric.target.toLocaleString()}`
                              : metric.target.toLocaleString()
                            }
                          </span>
                        </div>
                        <Progress 
                          value={(metric.current / metric.target) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Oportunidades de Crecimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Incrementar Tarifas de Servicios Premium</h4>
                    <p className="text-sm text-gray-600">
                      Basado en el análisis de mercado, puedes incrementar un 15% las tarifas 
                      de consultoría especializada sin afectar la demanda.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Programa de Fidelización</h4>
                    <p className="text-sm text-gray-600">
                      Implementar un programa de retainer mensual podría aumentar 
                      los ingresos recurrentes en un 30%.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Optimización de Procesos</h4>
                    <p className="text-sm text-gray-600">
                      Automatizar la generación de documentos podría reducir 
                      el tiempo de trabajo en un 20%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
