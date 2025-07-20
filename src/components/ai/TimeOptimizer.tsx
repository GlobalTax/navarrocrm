
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAdvancedAI } from '@/hooks/useAdvancedAI'

interface TimeOptimizationResult {
  currentEfficiency: number
  optimizedSchedule: Array<{
    time: string
    task: string
    priority: 'high' | 'medium' | 'low'
    estimatedDuration: number
    type: 'work' | 'break' | 'meeting'
  }>
  recommendations: Array<{
    type: 'efficiency' | 'balance' | 'priority'
    message: string
    impact: 'high' | 'medium' | 'low'
  }>
  timeDistribution: {
    productive_hours: number
    meeting_hours: number
    break_hours: number
    admin_hours: number
  }
  potentialSavings: number
}

export const TimeOptimizer = () => {
  const [optimizationResult, setOptimizationResult] = useState<TimeOptimizationResult | null>(null)
  const { isAnalyzing, optimizeSchedule } = useAdvancedAI()

  const handleOptimize = async () => {
    const result = await optimizeSchedule()
    if (result) {
      // Adaptar el resultado a la interfaz local
      const adaptedResult: TimeOptimizationResult = {
        currentEfficiency: result.currentEfficiency,
        optimizedSchedule: result.optimizedSchedule.map((item, index) => ({
          time: `${9 + index}:00`,
          task: item.task,
          priority: item.priority,
          estimatedDuration: item.optimizedTime,
          type: 'work' as const
        })),
        recommendations: result.recommendations.map(rec => ({
          type: 'efficiency' as const,
          message: rec.description,
          impact: rec.impact
        })),
        timeDistribution: {
          productive_hours: result.timeDistribution.reduce((acc, item) => 
            item.category === 'productive' ? acc + item.hours : acc, 0),
          meeting_hours: result.timeDistribution.reduce((acc, item) => 
            item.category === 'meetings' ? acc + item.hours : acc, 0),
          break_hours: result.timeDistribution.reduce((acc, item) => 
            item.category === 'breaks' ? acc + item.hours : acc, 0),
          admin_hours: result.timeDistribution.reduce((acc, item) => 
            item.category === 'admin' ? acc + item.hours : acc, 0)
        },
        potentialSavings: result.potentialSavings
      }
      setOptimizationResult(adaptedResult)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'efficiency': return <TrendingUp className="h-4 w-4" />
      case 'balance': return <Clock className="h-4 w-4" />
      case 'priority': return <AlertTriangle className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Optimizador de Tiempo IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Button onClick={handleOptimize} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? 'Optimizando...' : 'Optimizar Mi Agenda'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Analizará tus tareas, reuniones y patrones de trabajo
            </p>
          </div>
        </CardContent>
      </Card>

      {optimizationResult && (
        <div className="space-y-4">
          {/* Métricas de eficiencia */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Eficiencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Eficiencia Actual</p>
                  <div className="flex items-center gap-3">
                    <Progress value={optimizationResult.currentEfficiency} className="flex-1" />
                    <span className="text-lg font-bold">
                      {optimizationResult.currentEfficiency}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Ahorro Potencial</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {optimizationResult.potentialSavings}h/semana
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {optimizationResult.timeDistribution.productive_hours}h
                  </p>
                  <p className="text-xs text-gray-500">Trabajo Productivo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {optimizationResult.timeDistribution.meeting_hours}h
                  </p>
                  <p className="text-xs text-gray-500">Reuniones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {optimizationResult.timeDistribution.break_hours}h
                  </p>
                  <p className="text-xs text-gray-500">Descansos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {optimizationResult.timeDistribution.admin_hours}h
                  </p>
                  <p className="text-xs text-gray-500">Administrativo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agenda optimizada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda Optimizada para Mañana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {optimizationResult.optimizedSchedule.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-medium w-16">
                        {item.time}
                      </span>
                      <div>
                        <p className="font-medium">{item.task}</p>
                        <p className="text-xs text-gray-500">
                          {item.estimatedDuration} min • {item.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimizationResult.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <div className="flex items-start gap-3">
                    <div className={getImpactColor(rec.impact)}>
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <AlertDescription>
                        {rec.message}
                        <Badge variant="outline" className="ml-2 text-xs">
                          Impacto: {rec.impact}
                        </Badge>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
