import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { useLogger, getStoredLogs, clearStoredLogs } from '@/hooks/useLogger'
import { getMemoStats, clearMemoStats } from '@/hooks/useOptimizedMemo'

interface PerformanceMetrics {
  loading: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  memory?: {
    used: number
    total: number
    limit: number
  }
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [memoStats, setMemoStats] = useState<Map<string, any>>(new Map())
  const [isVisible, setIsVisible] = useState(false)
  const logger = useLogger('PerformanceMonitor')

  useEffect(() => {
    collectMetrics()
    loadLogs()
    loadMemoStats()
  }, [])

  const collectMetrics = () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const newMetrics: PerformanceMetrics = {
        loading: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Se actualiza con observer
        cumulativeLayoutShift: 0, // Se actualiza con observer
        firstInputDelay: 0 // Se actualiza con observer
      }

      // Memoria si está disponible
      if ('memory' in performance) {
        const memory = (performance as any).memory
        newMetrics.memory = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        }
      }

      setMetrics(newMetrics)
      logger.info('Performance metrics collected', { 
        loading: newMetrics.loading,
        domContentLoaded: newMetrics.domContentLoaded,
        firstContentfulPaint: newMetrics.firstContentfulPaint
      })
    } catch (error) {
      logger.error('Failed to collect performance metrics', { error })
    }
  }

  const loadLogs = () => {
    const storedLogs = getStoredLogs()
    setLogs(storedLogs.slice(-20)) // Últimos 20 logs
  }

  const loadMemoStats = () => {
    const stats = getMemoStats() as Map<string, any>
    setMemoStats(stats)
  }

  const clearAllLogs = () => {
    clearStoredLogs()
    setLogs([])
    logger.info('All logs cleared')
  }

  const clearAllMemoStats = () => {
    clearMemoStats()
    setMemoStats(new Map())
    logger.info('All memo stats cleared')
  }

  const getMetricStatus = (metric: number, thresholds: { good: number; fair: number }) => {
    if (metric <= thresholds.good) return 'good'
    if (metric <= thresholds.fair) return 'fair'
    return 'poor'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'default'
      case 'fair': return 'secondary'
      case 'poor': return 'destructive'
      default: return 'secondary'
    }
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="border-0.5 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Performance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* Métricas Web Vitals */}
          {metrics && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                Web Vitals
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between">
                  <span>FCP:</span>
                  <Badge variant={getStatusColor(getMetricStatus(metrics.firstContentfulPaint, { good: 1800, fair: 3000 }))}>
                    {Math.round(metrics.firstContentfulPaint)}ms
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>DOM:</span>
                  <Badge variant={getStatusColor(getMetricStatus(metrics.domContentLoaded, { good: 800, fair: 1600 }))}>
                    {Math.round(metrics.domContentLoaded)}ms
                  </Badge>
                </div>
              </div>

              {metrics.memory && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Cpu className="h-3 w-3 mr-1" />
                      Memory:
                    </span>
                    <span>{metrics.memory.used}MB / {metrics.memory.total}MB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full"
                      style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estadísticas de Memoización */}
          {memoStats.size > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  <HardDrive className="h-3 w-3 mr-1" />
                  Memo Stats
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllMemoStats}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
              
              <div className="space-y-1 max-h-24 overflow-auto">
                {Array.from(memoStats.entries()).map(([key, stats]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{key}:</span>
                    <span className="text-muted-foreground">
                      {stats.computations}c / {stats.cacheHits}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs Recientes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Recent Logs ({logs.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllLogs}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-auto">
              {logs.slice(-10).map((log, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  {log.level === 'error' ? (
                    <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                  ) : log.level === 'warn' ? (
                    <AlertTriangle className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{log.message}</div>
                    {log.context?.component && (
                      <div className="text-muted-foreground text-xs">
                        {log.context.component}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={collectMetrics}
              className="flex-1 h-8 text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMemoStats}
              className="flex-1 h-8 text-xs"
            >
              <HardDrive className="h-3 w-3 mr-1" />
              Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}