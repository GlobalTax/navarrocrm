
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealTimeAnalytics } from '@/hooks/analytics/useRealTimeAnalytics'
import { Users, Eye, AlertTriangle, Activity, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export const RealTimeMetricsChart: React.FC = () => {
  const { metrics, activeSessions, isLoading, refreshMetrics } = useRealTimeAnalytics()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getPerformanceStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
      default:
        return 'good'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Métricas en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Última actualización: {metrics.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              últimos 5 minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas Vistas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageViews}</div>
            <p className="text-xs text-muted-foreground">
              última hora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores Totales</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              tasa: {metrics.errorRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(getPerformanceStatus('lcp', metrics.avgPerformance.lcp))} text-white`}
              >
                LCP
              </Badge>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(getPerformanceStatus('fid', metrics.avgPerformance.fid))} text-white`}
              >
                FID
              </Badge>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(getPerformanceStatus('cls', metrics.avgPerformance.cls))} text-white`}
              >
                CLS
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Páginas Más Visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.topPages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="page" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-300 overflow-y-auto">
              {activeSessions.slice(0, 8).map((session, index) => (
                <div key={session.sessionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-sm">
                        Usuario {session.userId ? session.userId.slice(0, 8) : 'Anónimo'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.pageViews} páginas • {session.errorsCount} errores
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatDuration(session.duration)}</p>
                    <p>{session.lastActivity.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No hay sesiones activas en este momento
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
