
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Database, TrendingUp, Clock } from 'lucide-react'
import { useAPICache, useFormCache } from '@/hooks/cache'

export const CacheStatsPanel = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  // Create cache instances to get stats
  const apiCache = useAPICache()
  const formCache = useFormCache('stats_panel')

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleClearApiCache = async () => {
    await apiCache.clear()
    handleRefresh()
  }

  const handleClearFormCache = async () => {
    await formCache.clear()
    handleRefresh()
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cache Stats
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
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* API Cache Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">API Cache</span>
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
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-blue-500" />
                  <span>Ready: {apiCache.isReady ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Cache Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Form Cache</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFormCache}
                className="h-5 text-xs px-2"
              >
                Clear
              </Button>
            </div>
            {formCache.stats && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span>Ready: {formCache.isReady ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <span className="text-xs font-medium text-gray-700">Status:</span>
            <Badge variant="secondary" className="text-xs ml-2">
              Cache System Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
