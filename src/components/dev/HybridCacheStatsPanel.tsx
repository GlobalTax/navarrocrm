
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RefreshCw, Database, TrendingUp, Clock, Zap, HardDrive } from 'lucide-react'
import { useOptimizedAPICache, useOptimizedFormCache } from '@/hooks/cache'

export const HybridCacheStatsPanel = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const apiCache = useOptimizedAPICache()
  const formCache = useOptimizedFormCache('stats_panel')

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleClearApiCache = async () => {
    await apiCache.clearCache()
    handleRefresh()
  }

  const handleClearFormCache = async () => {
    await formCache.clearFormData()
    handleRefresh()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Hybrid Cache Stats
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Sistema de caché híbrido (Memoria + IndexedDB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* API Cache Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Database className="h-3 w-3 text-blue-500" />
                API Cache
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearApiCache}
                className="h-5 text-xs px-2"
              >
                Clear
              </Button>
            </div>
            {apiCache.stats && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>Memoria: {apiCache.stats.memoryItems}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-gray-500" />
                    <span>IndexedDB: {apiCache.stats.persistentItems}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>Hit Rate: {(apiCache.stats.hitRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>Promotions: {apiCache.stats.promotions}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Memoria</span>
                    <span>{formatBytes(apiCache.stats.memorySize)}</span>
                  </div>
                  <Progress 
                    value={(apiCache.stats.memorySize / (100 * 1024 * 1024)) * 100} 
                    className="h-1" 
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>IndexedDB</span>
                    <span>{formatBytes(apiCache.stats.persistentSize)}</span>
                  </div>
                  <Progress 
                    value={(apiCache.stats.persistentSize / (500 * 1024 * 1024)) * 100} 
                    className="h-1" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Cache Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Database className="h-3 w-3 text-purple-500" />
                Form Cache
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFormCache}
                className="h-5 text-xs px-2"
              >
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Badge variant={formCache.isReady ? "default" : "secondary"} className="text-xs">
                {formCache.isReady ? 'Ready' : 'Loading'}
              </Badge>
            </div>
          </div>

          {/* Status General */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Status:</span>
              <Badge variant="default" className="text-xs">
                Hybrid Cache Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
