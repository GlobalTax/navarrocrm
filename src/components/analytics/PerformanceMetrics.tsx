
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Clock, Gauge, AlertTriangle } from 'lucide-react'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[]
  className?: string
}

const getMetricIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'lcp':
      return <Clock className="h-4 w-4" />
    case 'fid':
      return <Zap className="h-4 w-4" />
    case 'cls':
      return <Gauge className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'bg-green-100 text-green-800'
    case 'needs-improvement':
      return 'bg-yellow-100 text-yellow-800'
    case 'poor':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'good':
      return 'Bueno'
    case 'needs-improvement':
      return 'Mejorable'
    case 'poor':
      return 'Malo'
    default:
      return 'N/A'
  }
}

export const PerformanceMetrics = ({ metrics, className = '' }: PerformanceMetricsProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Métricas de Rendimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {getMetricIcon(metric.name)}
                <div>
                  <p className="font-medium">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(metric.status)}>
                {getStatusLabel(metric.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
