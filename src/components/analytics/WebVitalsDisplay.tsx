
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Gauge, Zap, Layout, Clock } from 'lucide-react'
import { AnalyticsWidget } from './AnalyticsWidget'

interface WebVital {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
  unit: string
  description: string
}

export const WebVitalsDisplay: React.FC = () => {
  // Simulamos métricas de Web Vitals (en una implementación real vendrían del hook)
  const webVitals: WebVital[] = [
    {
      name: 'Largest Contentful Paint (LCP)',
      value: 1.2,
      rating: 'good',
      threshold: { good: 2.5, poor: 4.0 },
      unit: 's',
      description: 'Tiempo hasta que se renderiza el elemento principal'
    },
    {
      name: 'First Input Delay (FID)',
      value: 45,
      rating: 'good',
      threshold: { good: 100, poor: 300 },
      unit: 'ms',
      description: 'Tiempo de respuesta a la primera interacción'
    },
    {
      name: 'Cumulative Layout Shift (CLS)',
      value: 0.08,
      rating: 'needs-improvement',
      threshold: { good: 0.1, poor: 0.25 },
      unit: '',
      description: 'Estabilidad visual de la página'
    },
    {
      name: 'First Contentful Paint (FCP)',
      value: 0.9,
      rating: 'good',
      threshold: { good: 1.8, poor: 3.0 },
      unit: 's',
      description: 'Tiempo hasta el primer contenido visible'
    }
  ]

  const getRatingColor = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRatingBadge = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good': return <Badge className="bg-green-100 text-green-800">Bueno</Badge>
      case 'needs-improvement': return <Badge className="bg-yellow-100 text-yellow-800">Mejorable</Badge>
      case 'poor': return <Badge className="bg-red-100 text-red-800">Pobre</Badge>
    }
  }

  const getProgressValue = (vital: WebVital) => {
    const { value, threshold } = vital
    if (value <= threshold.good) return (value / threshold.good) * 40 // 0-40% para "good"
    if (value <= threshold.poor) return 40 + ((value - threshold.good) / (threshold.poor - threshold.good)) * 40 // 40-80% para "needs improvement"
    return 80 + Math.min(((value - threshold.poor) / threshold.poor) * 20, 20) // 80-100% para "poor"
  }

  const getProgressColor = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const icons = [
    <Gauge className="h-4 w-4" />,
    <Zap className="h-4 w-4" />,
    <Layout className="h-4 w-4" />,
    <Clock className="h-4 w-4" />
  ]

  return (
    <div className="space-y-6">
      {/* Resumen de Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {webVitals.map((vital, index) => (
          <AnalyticsWidget
            key={vital.name}
            title={vital.name.split(' ')[0]}
            value={`${vital.value}${vital.unit}`}
            icon={icons[index]}
            trend={vital.rating === 'good' ? 'up' : vital.rating === 'poor' ? 'down' : 'neutral'}
            trendValue={vital.rating === 'good' ? 'Óptimo' : vital.rating === 'poor' ? 'Crítico' : 'Mejorable'}
          />
        ))}
      </div>

      {/* Detalles de Web Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {webVitals.map((vital) => (
          <Card key={vital.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{vital.name}</CardTitle>
                {getRatingBadge(vital.rating)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor actual</span>
                  <span className={`font-medium ${getRatingColor(vital.rating)}`}>
                    {vital.value}{vital.unit}
                  </span>
                </div>
                <Progress 
                  value={getProgressValue(vital)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Bueno: ≤{vital.threshold.good}{vital.unit}</span>
                  <span>Pobre: ≥{vital.threshold.poor}{vital.unit}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {vital.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de Optimización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webVitals
              .filter(vital => vital.rating !== 'good')
              .map((vital) => (
                <div key={vital.name} className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-1">{vital.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {vital.rating === 'needs-improvement' ? 
                      'Considera optimizar imágenes y reducir JavaScript no crítico.' :
                      'Requiere optimización urgente. Revisa recursos que bloquean el renderizado.'
                    }
                  </p>
                </div>
              ))}
            {webVitals.every(vital => vital.rating === 'good') && (
              <div className="text-center p-4">
                <p className="text-green-600 font-medium">🎉 ¡Excelente rendimiento!</p>
                <p className="text-sm text-muted-foreground">
                  Todas las métricas de Web Vitals están en rangos óptimos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
