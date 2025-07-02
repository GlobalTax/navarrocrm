import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics'

export const PredictiveAnalyticsDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  
  const {
    conversionPredictions,
    churnRiskAnalysis,
    revenueForecasts,
    optimizationSuggestions,
    performanceMetrics,
    refreshPredictions
  } = usePredictiveAnalytics(selectedTimeframe)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRiskLevel = (risk: number) => {
    if (risk <= 30) return { level: 'Bajo', color: 'text-green-600', bg: 'bg-green-50' }
    if (risk <= 70) return { level: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'Alto', color: 'text-red-600', bg: 'bg-red-50' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-[10px]">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl">Analytics Predictivos con IA</div>
              <div className="text-sm font-normal text-gray-600">
                Predicciones inteligentes para optimizar el onboarding
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant={selectedTimeframe === '7d' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe('7d')}
                className="border-0.5 border-black rounded-[10px]"
              >
                7 días
              </Button>
              <Button
                variant={selectedTimeframe === '30d' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe('30d')}
                className="border-0.5 border-black rounded-[10px]"
              >
                30 días
              </Button>
              <Button
                variant={selectedTimeframe === '90d' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe('90d')}
                className="border-0.5 border-black rounded-[10px]"
              >
                90 días
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performanceMetrics.predictionAccuracy}%</div>
              <div className="text-xs text-gray-600">Precisión IA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performanceMetrics.conversionImprovement}%</div>
              <div className="text-xs text-gray-600">Mejora Conversión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{performanceMetrics.timeReduction}%</div>
              <div className="text-xs text-gray-600">Reducción Tiempo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${performanceMetrics.revenueImpact}</div>
              <div className="text-xs text-gray-600">Impacto Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predicciones
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Riesgo Churn
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue Forecast
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimización
          </TabsTrigger>
        </TabsList>

        {/* Predicciones de Conversión */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Predicciones */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Predicciones de Conversión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {conversionPredictions.map((prediction, index) => (
                  <div 
                    key={prediction.prospectId} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {prediction.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{prediction.name}</div>
                        <div className="text-sm text-gray-600">{prediction.sector}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`border-0.5 rounded-[10px] ${getScoreColor(prediction.conversionScore)}`}
                      >
                        {prediction.conversionScore}% probabilidad
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {prediction.estimatedDays} días
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gráfico de Tendencias */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Tendencias de Conversión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {conversionPredictions.filter(p => p.conversionScore >= 80).length}
                      </div>
                      <div className="text-xs text-gray-600">Alta Probabilidad</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {conversionPredictions.filter(p => p.conversionScore >= 60 && p.conversionScore < 80).length}
                      </div>
                      <div className="text-xs text-gray-600">Media Probabilidad</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {conversionPredictions.filter(p => p.conversionScore < 60).length}
                      </div>
                      <div className="text-xs text-gray-600">Baja Probabilidad</div>
                    </div>
                  </div>

                  {/* Factores de Conversión */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Factores Clave de Conversión:</div>
                    {[
                      { factor: 'Tiempo de respuesta inicial', impact: 85 },
                      { factor: 'Calidad de la documentación', impact: 78 },
                      { factor: 'Experiencia del abogado asignado', impact: 72 },
                      { factor: 'Claridad en la propuesta', impact: 69 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.factor}</span>
                          <span className="font-medium">{item.impact}%</span>
                        </div>
                        <Progress value={item.impact} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análisis de Riesgo de Churn */}
        <TabsContent value="churn" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clientes en Riesgo */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Clientes en Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {churnRiskAnalysis.map((client, index) => {
                  const risk = getRiskLevel(client.churnRisk)
                  return (
                    <div 
                      key={client.clientId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-600">
                            Último contacto: {client.lastContactDays} días
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`border-0.5 rounded-[10px] ${risk.color} ${risk.bg} border-current`}
                        >
                          {risk.level} ({client.churnRisk}%)
                        </Badge>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-0.5 border-black rounded-[10px]"
                        >
                          Actuar
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Estrategias de Retención */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Estrategias de Retención
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    strategy: 'Contacto proactivo',
                    effectiveness: 89,
                    description: 'Llamada personalizada dentro de 24h'
                  },
                  {
                    strategy: 'Oferta de valor adicional',
                    effectiveness: 76,
                    description: 'Servicios complementarios sin coste'
                  },
                  {
                    strategy: 'Mejora en comunicación',
                    effectiveness: 68,
                    description: 'Updates más frecuentes del caso'
                  },
                  {
                    strategy: 'Reunión estratégica',
                    effectiveness: 72,
                    description: 'Revisión completa del caso'
                  }
                ].map((strategy, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-[10px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{strategy.strategy}</span>
                      <Badge 
                        variant="outline"
                        className="border-0.5 border-green-400 text-green-600 rounded-[10px]"
                      >
                        {strategy.effectiveness}% eficacia
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pronóstico de Revenue */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proyecciones */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Proyecciones de Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueForecasts.map((forecast, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{forecast.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          €{forecast.predicted.toLocaleString()}
                        </span>
                        {forecast.change > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${forecast.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {forecast.change > 0 ? '+' : ''}{forecast.change}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Confianza: {forecast.confidence}%</span>
                      <span>vs. período anterior: €{forecast.previous.toLocaleString()}</span>
                    </div>
                    <Progress value={forecast.confidence} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Oportunidades */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Oportunidades Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    opportunity: 'Upselling servicios corporativos',
                    potential: 25000,
                    probability: 78,
                    timeline: '2-3 meses'
                  },
                  {
                    opportunity: 'Expansión servicios laborales',
                    potential: 18000,
                    probability: 65,
                    timeline: '1-2 meses'
                  },
                  {
                    opportunity: 'Servicios de compliance',
                    potential: 32000,
                    probability: 82,
                    timeline: '3-4 meses'
                  }
                ].map((opp, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-[10px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{opp.opportunity}</span>
                      <Badge 
                        variant="outline"
                        className="border-0.5 border-blue-400 text-blue-600 rounded-[10px]"
                      >
                        €{opp.potential.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Probabilidad: {opp.probability}%</span>
                      <span>Timeline: {opp.timeline}</span>
                    </div>
                    <Progress value={opp.probability} className="h-2 mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sugerencias de Optimización */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sugerencias Activas */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Sugerencias de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-[10px]">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{suggestion.title}</span>
                          <Badge 
                            variant="outline"
                            className={`border-0.5 rounded-[10px] ${
                              suggestion.priority === 'high' ? 'border-red-400 text-red-600' :
                              suggestion.priority === 'medium' ? 'border-yellow-400 text-yellow-600' :
                              'border-green-400 text-green-600'
                            }`}
                          >
                            {suggestion.impact}% impacto
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                          >
                            Implementar
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-0.5 border-black rounded-[10px]"
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Métricas de Optimización */}
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Impacto de Optimizaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { metric: 'Tiempo de onboarding', before: 45, after: 28, unit: 'min' },
                    { metric: 'Tasa de conversión', before: 72, after: 89, unit: '%' },
                    { metric: 'Satisfacción cliente', before: 8.2, after: 9.1, unit: '/10' },
                    { metric: 'Revenue por cliente', before: 2800, after: 3200, unit: '€' }
                  ].map((metric, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-[10px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {metric.before}{metric.unit} → {metric.after}{metric.unit}
                          </span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Mejora: {metric.unit === '%' ? 
                          `+${metric.after - metric.before}%` : 
                          `+${((metric.after - metric.before) / metric.before * 100).toFixed(1)}%`
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-[10px] border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      €47,500
                    </div>
                    <div className="text-sm text-gray-600">
                      Revenue adicional generado por optimizaciones IA
                    </div>
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