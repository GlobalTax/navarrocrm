
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useRealTimeAnalytics } from '@/hooks/analytics/useRealTimeAnalytics'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, Eye, AlertTriangle } from 'lucide-react'
import { AnalyticsWidget } from './AnalyticsWidget'

export const RealTimeMetricsChart: React.FC = () => {
  const { metrics, activeSessions, isLoading } = useRealTimeAnalytics()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Datos para el gráfico de líneas (simulados para demo)
  const chartData = [
    { time: '00:00', usuarios: 5, pageViews: 12, errores: 0 },
    { time: '00:05', usuarios: 8, pageViews: 18, errores: 1 },
    { time: '00:10', usuarios: 12, pageViews: 24, errores: 0 },
    { time: '00:15', usuarios: metrics.activeUsers, pageViews: metrics.pageViews, errores: metrics.totalErrors },
  ]

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsWidget
          title="Usuarios Activos"
          value={metrics.activeUsers}
          icon={<Users className="h-4 w-4" />}
          trend={metrics.activeUsers > 10 ? 'up' : 'neutral'}
          trendValue={`${metrics.activeUsers > 0 ? '+' : ''}${metrics.activeUsers}`}
        />
        
        <AnalyticsWidget
          title="Páginas Vistas"
          value={metrics.pageViews}
          icon={<Eye className="h-4 w-4" />}
          trend="up"
          trendValue={`+${metrics.pageViews}`}
        />
        
        <AnalyticsWidget
          title="Errores Totales"
          value={metrics.totalErrors}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={metrics.totalErrors > 0 ? 'down' : 'neutral'}
          trendValue={metrics.totalErrors > 0 ? `${metrics.totalErrors} errores` : 'Sin errores'}
        />
        
        <AnalyticsWidget
          title="Tasa de Errores"
          value={`${metrics.errorRate.toFixed(1)}%`}
          icon={<Activity className="h-4 w-4" />}
          trend={metrics.errorRate < 1 ? 'up' : 'down'}
          trendValue={`${metrics.errorRate.toFixed(1)}%`}
        />
      </div>

      {/* Gráfico de actividad en tiempo real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Actividad en Tiempo Real
            <Badge variant="secondary" className="animate-pulse">
              ● En vivo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="usuarios" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Usuarios Activos"
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Páginas Vistas"
              />
              <Line 
                type="monotone" 
                dataKey="errores" 
                stroke="#ff7300" 
                strokeWidth={2}
                name="Errores"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Páginas más visitadas */}
      {metrics.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Páginas Más Visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{page.page}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{page.views} vistas</span>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sesiones activas */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Activas ({activeSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.slice(0, 5).map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {session.userId ? `Usuario ${session.userId.slice(0, 8)}...` : 'Usuario Anónimo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.pageViews} páginas • {session.errorsCount} errores
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(session.duration / 60000)}m {Math.floor((session.duration % 60000) / 1000)}s
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Activo
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de última actualización */}
      <div className="text-center text-xs text-muted-foreground">
        Última actualización: {metrics.lastUpdated.toLocaleTimeString('es-ES')}
      </div>
    </div>
  )
}
