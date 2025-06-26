
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Database, TrendingUp, Clock, Zap, HardDrive, Trash2 } from 'lucide-react'
import { useOptimizedAPICache } from '@/hooks/cache/useOptimizedAPICache'

interface CacheMetricsData {
  apiCache: any
  totalRequests: number
  hitRate: number
  avgResponseTime: number
  memoryUsage: number
  persistentUsage: number
}

export const CacheMetricsPanel = () => {
  const [metrics, setMetrics] = useState<CacheMetricsData | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const apiCache = useOptimizedAPICache()

  const refreshMetrics = () => {
    if (apiCache.isReady) {
      const cacheMetrics = apiCache.getMetrics()
      
      setMetrics({
        apiCache: cacheMetrics,
        totalRequests: cacheMetrics.totalRequests || 0,
        hitRate: cacheMetrics.hitRate || 0,
        avgResponseTime: 0, // Esto se podría calcular con más detalle
        memoryUsage: cacheMetrics.cacheStats?.memorySize || 0,
        persistentUsage: cacheMetrics.cacheStats?.persistentSize || 0
      })
    }
    setRefreshKey(prev => prev + 1)
  }

  const handleClearCache = async () => {
    await apiCache.clearCache()
    refreshMetrics()
  }

  useEffect(() => {
    refreshMetrics()
    
    // Actualizar métricas cada 30 segundos
    const interval = setInterval(refreshMetrics, 30000)
    return () => clearInterval(interval)
  }, [apiCache.isReady])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Cache Metrics
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshMetrics}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCache}
                className="h-6 w-6 p-0 text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Sistema de caché híbrido optimizado
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {metrics && (
            <>
              {/* Estadísticas generales */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Hit Rate</span>
                </div>
                <Badge variant={metrics.hitRate > 0.8 ? "default" : "secondary"} className="text-xs">
                  {formatPercentage(metrics.hitRate)}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span>Requests</span>
                </div>
                <span className="text-xs font-mono">{metrics.totalRequests}</span>
              </div>

              {/* Uso de memoria */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Memoria
                  </span>
                  <span>{formatBytes(metrics.memoryUsage)}</span>
                </div>
                <Progress 
                  value={(metrics.memoryUsage / (100 * 1024 * 1024)) * 100} 
                  className="h-1" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-gray-500" />
                    IndexedDB
                  </span>
                  <span>{formatBytes(metrics.persistentUsage)}</span>
                </div>
                <Progress 
                  value={(metrics.persistentUsage / (500 * 1024 * 1024)) * 100} 
                  className="h-1" 
                />
              </div>

              {/* Estado del sistema */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span>Sistema:</span>
                  <Badge variant="default" className="text-xs">
                    {apiCache.isReady ? 'Activo' : 'Inicializando'}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
