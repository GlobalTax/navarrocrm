import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target,
  AlertCircle,
  CheckCircle,
  Timer,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineMetricsProps {
  metrics: {
    totalCandidates: number
    activeThisWeek: number
    avgTimeToHire: number
    conversionRate: number
    bottlenecks: string[]
    stageMetrics: Record<string, {
      count: number
      avgDays: number
      conversionRate: number
      trend: 'up' | 'down' | 'stable'
    }>
    predictions: {
      expectedHires: number
      timeToNextHire: number
      topBottleneck: string
    }
  }
}

export function PipelineMetrics({ metrics }: PipelineMetricsProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getBottleneckSeverity = (stage: string) => {
    // Lógica para determinar severidad del cuello de botella
    const severityMap: Record<string, 'high' | 'medium' | 'low'> = {
      'interviewing': 'high',
      'screening': 'medium',
      'new': 'low'
    }
    return severityMap[stage] || 'low'
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total en Pipeline</p>
                <p className="text-2xl font-bold">{metrics.totalCandidates}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{metrics.activeThisWeek} esta semana
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{metrics.avgTimeToHire}d</p>
                <p className="text-xs text-muted-foreground">tiempo hasta contratación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Conversión</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">candidatos contratados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Siguiente Contratación</p>
                <p className="text-2xl font-bold">{metrics.predictions.timeToNextHire}d</p>
                <p className="text-xs text-muted-foreground">estimación IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de cuellos de botella */}
      {metrics.bottlenecks.length > 0 && (
        <Card className="border-0.5 border-foreground rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              <span>Cuellos de Botella Detectados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.bottlenecks.map((stage) => {
                const severity = getBottleneckSeverity(stage)
                const stageData = metrics.stageMetrics[stage]
                
                return (
                  <div key={stage} className="p-4 border rounded-[10px] border-0.5 border-foreground">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{stage}</h4>
                      <Badge 
                        variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'secondary' : 'outline'}
                        className="rounded-[10px]"
                      >
                        {severity === 'high' ? 'Crítico' : severity === 'medium' ? 'Moderado' : 'Leve'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Candidatos:</span>
                        <span className="font-medium">{stageData?.count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiempo promedio:</span>
                        <span className="font-medium">{stageData?.avgDays || 0}d</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tendencia:</span>
                        <span className="flex items-center space-x-1">
                          {getTrendIcon(stageData?.trend || 'stable')}
                          <span className="font-medium">{stageData?.conversionRate || 0}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predicciones y recomendaciones */}
      <Card className="border-0.5 border-foreground rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Predicciones e Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Predicciones</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-[10px] border-0.5 border-foreground">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Contrataciones esperadas este mes</p>
                    <p className="text-xs text-muted-foreground">{metrics.predictions.expectedHires} candidatos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-[10px] border-0.5 border-foreground">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Próxima contratación en</p>
                    <p className="text-xs text-muted-foreground">{metrics.predictions.timeToNextHire} días (estimado)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Recomendaciones</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-[10px]">
                  <p className="text-sm font-medium text-blue-800">Optimizar etapa de entrevistas</p>
                  <p className="text-xs text-blue-600">Considera agregar más entrevistadores para reducir el tiempo de espera</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-[10px]">
                  <p className="text-sm font-medium text-green-800">Buen flujo en evaluación</p>
                  <p className="text-xs text-green-600">La etapa de screening está funcionando eficientemente</p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-[10px]">
                  <p className="text-sm font-medium text-orange-800">Revisar proceso de ofertas</p>
                  <p className="text-xs text-orange-600">Algunos candidatos en "oferta enviada" llevan demasiado tiempo</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}