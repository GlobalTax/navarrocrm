import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Zap, 
  Clock, 
  MemoryStick, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Download
} from 'lucide-react'
import { useLogger } from '@/hooks/useLogger'

interface PerformanceMetrics {
  memoryUsage: number
  renderCount: number
  avgRenderTime: number
  errorCount: number
  componentsCount: number
  activeTimers: number
  activeFetches: number
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderCount: 0,
    avgRenderTime: 0,
    errorCount: 0,
    componentsCount: 0,
    activeTimers: 0,
    activeFetches: 0
  })
  
  const [isEnabled, setIsEnabled] = useState(process.env.NODE_ENV === 'development')
  const logger = useLogger('PerformanceDashboard')

  useEffect(() => {
    if (!isEnabled) return

    const interval = setInterval(() => {
      const memory = (performance as any).memory
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
        renderCount: prev.renderCount + 1
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isEnabled])

  const getHealthStatus = () => {
    if (metrics.memoryUsage > 100) return { status: 'critical', color: 'destructive' }
    if (metrics.memoryUsage > 50) return { status: 'warning', color: 'warning' }
    return { status: 'good', color: 'success' }
  }

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        timing: performance.timing
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    logger.info('Performance report downloaded', {
      timestamp: new Date().toISOString(),
      metrics: {
        memoryUsage: metrics.memoryUsage.toFixed(1) + 'MB',
        renderCount: metrics.renderCount,
        avgRenderTime: metrics.avgRenderTime.toFixed(1) + 'ms'
      }
    })
  }

  if (!isEnabled) {
    return (
      <Card className="border-0.5 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            El monitor de performance está disponible solo en modo desarrollo.
          </p>
          <Button 
            onClick={() => setIsEnabled(true)} 
            size="sm"
            className="border-0.5 border-black rounded-[10px]"
          >
            Activar en Producción
          </Button>
        </CardContent>
      </Card>
    )
  }

  const health = getHealthStatus()

  return (
    <div className="space-y-4">
      {/* Health Status */}
      <Card className="border-0.5 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estado de Performance
            </div>
            <Badge variant={health.color as any}>
              {health.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MemoryStick className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}MB</p>
              <p className="text-xs text-muted-foreground">Memoria</p>
              <Progress value={(metrics.memoryUsage / 100) * 100} className="h-1 mt-1" />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{metrics.renderCount}</p>
              <p className="text-xs text-muted-foreground">Renders</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold">{metrics.avgRenderTime.toFixed(1)}ms</p>
              <p className="text-xs text-muted-foreground">Tiempo Avg</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {metrics.errorCount > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-2xl font-bold">{metrics.errorCount}</p>
              <p className="text-xs text-muted-foreground">Errores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Leak Detection */}
      <Card className="border-0.5 border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <TrendingUp className="h-5 w-5" />
            Detección de Memory Leaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Timers activos:</span>
              <Badge variant={metrics.activeTimers > 10 ? 'destructive' : 'secondary'}>
                {metrics.activeTimers}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span>Requests activos:</span>
              <Badge variant={metrics.activeFetches > 5 ? 'destructive' : 'secondary'}>
                {metrics.activeFetches}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span>Componentes montados:</span>
              <Badge variant="outline">
                {metrics.componentsCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={downloadReport}
          size="sm"
          variant="outline"
          className="border-0.5 border-black rounded-[10px]"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
        
        <Button 
          onClick={() => window.location.reload()}
          size="sm"
          variant="outline"
          className="border-0.5 border-black rounded-[10px]"
        >
          Reiniciar App
        </Button>
        
        <Button 
          onClick={() => setIsEnabled(false)}
          size="sm"
          variant="outline"
          className="border-0.5 border-black rounded-[10px]"
        >
          Desactivar Monitor
        </Button>
      </div>
    </div>
  )
}
