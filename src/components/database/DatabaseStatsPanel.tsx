
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDatabaseStats } from '@/hooks/database/useDatabaseStats'
import { 
  Database, 
  Clock, 
  BarChart3, 
  AlertTriangle,
  RefreshCw,
  Zap
} from 'lucide-react'

export const DatabaseStatsPanel = () => {
  const { stats, resetStats } = useDatabaseStats()

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">Loading statistics...</div>
        </CardContent>
      </Card>
    )
  }

  const hitRate = stats.totalQueries > 0 
    ? ((stats.cacheHits / stats.totalQueries) * 100).toFixed(1)
    : '0'

  const topTables = Object.entries(stats.tableStats)
    .sort(([,a], [,b]) => b.queries - a.queries)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
            <Button variant="outline" size="sm" onClick={resetStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Stats
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalQueries}
              </div>
              <div className="text-sm text-gray-500">Total Queries</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {hitRate}%
              </div>
              <div className="text-sm text-gray-500">Cache Hit Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageQueryTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-500">Avg Query Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.slowQueries}
              </div>
              <div className="text-sm text-gray-500">Slow Queries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {topTables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Most Active Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTables.map(([table, tableStats]) => (
                <div key={table} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{table}</Badge>
                    <span className="text-sm text-gray-600">
                      {tableStats.queries} queries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {tableStats.avgTime.toFixed(0)}ms avg
                    </span>
                    {tableStats.avgTime > 1000 && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                    {tableStats.avgTime < 200 && (
                      <Zap className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.slowQueries > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {stats.slowQueries} slow queries detected (&gt;1s)
                </span>
              </div>
            )}
            
            {parseFloat(hitRate) > 80 && (
              <div className="flex items-center gap-2 text-green-600">
                <Zap className="h-4 w-4" />
                <span className="text-sm">
                  Excellent cache performance ({hitRate}% hit rate)
                </span>
              </div>
            )}
            
            {parseFloat(hitRate) < 50 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Consider increasing cache TTL or reviewing query patterns
                </span>
              </div>
            )}
            
            {stats.averageQueryTime < 200 && (
              <div className="flex items-center gap-2 text-green-600">
                <Zap className="h-4 w-4" />
                <span className="text-sm">
                  Great average response time ({stats.averageQueryTime.toFixed(0)}ms)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
