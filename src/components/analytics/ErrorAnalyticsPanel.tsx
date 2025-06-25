
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Bug, Wifi, Code, RefreshCw } from 'lucide-react'
import { AnalyticsWidget } from './AnalyticsWidget'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ErrorData {
  id: string
  type: 'error' | 'unhandledrejection' | 'resource' | 'network'
  message: string
  count: number
  lastOccurred: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedUsers: number
}

export const ErrorAnalyticsPanel: React.FC = () => {
  // Datos simulados de errores (en implementación real vendrían de la API)
  const errorData: ErrorData[] = [
    {
      id: '1',
      type: 'error',
      message: 'Cannot read property of undefined',
      count: 12,
      lastOccurred: new Date(Date.now() - 1000 * 60 * 15),
      severity: 'high',
      affectedUsers: 8
    },
    {
      id: '2',
      type: 'network',
      message: 'Failed to fetch /api/contacts',
      count: 5,
      lastOccurred: new Date(Date.now() - 1000 * 60 * 30),
      severity: 'medium',
      affectedUsers: 3
    },
    {
      id: '3',
      type: 'resource',
      message: 'Failed to load image resource',
      count: 3,
      lastOccurred: new Date(Date.now() - 1000 * 60 * 45),
      severity: 'low',
      affectedUsers: 2
    }
  ]

  const errorsByType = [
    { name: 'JavaScript', value: 12, color: '#ff6b6b' },
    { name: 'Network', value: 5, color: '#4ecdc4' },
    { name: 'Resource', value: 3, color: '#45b7d1' },
    { name: 'Unhandled', value: 1, color: '#96ceb4' }
  ]

  const errorTrend = [
    { time: '00:00', errores: 0 },
    { time: '06:00', errores: 2 },
    { time: '12:00', errores: 8 },
    { time: '18:00', errores: 15 },
    { time: '24:00', errores: 21 }
  ]

  const getSeverityColor = (severity: ErrorData['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: ErrorData['type']) => {
    switch (type) {
      case 'error': return <Bug className="h-3 w-3" />
      case 'network': return <Wifi className="h-3 w-3" />
      case 'resource': return <Code className="h-3 w-3" />
      case 'unhandledrejection': return <AlertTriangle className="h-3 w-3" />
      default: return <AlertTriangle className="h-3 w-3" />
    }
  }

  const totalErrors = errorData.reduce((sum, error) => sum + error.count, 0)
  const criticalErrors = errorData.filter(e => e.severity === 'critical').length
  const affectedUsers = Math.max(...errorData.map(e => e.affectedUsers))

  return (
    <div className="space-y-6">
      {/* Métricas de errores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsWidget
          title="Errores Totales"
          value={totalErrors}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={totalErrors > 10 ? 'down' : 'neutral'}
          trendValue={`${totalErrors} errores`}
        />
        
        <AnalyticsWidget
          title="Errores Críticos"
          value={criticalErrors}
          icon={<Bug className="h-4 w-4" />}
          trend={criticalErrors > 0 ? 'down' : 'up'}
          trendValue={criticalErrors > 0 ? `${criticalErrors} críticos` : 'Sin críticos'}
        />
        
        <AnalyticsWidget
          title="Usuarios Afectados"
          value={affectedUsers}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend="neutral"
          trendValue={`${affectedUsers} usuarios`}
        />
        
        <AnalyticsWidget
          title="Tasa de Errores"
          value="2.1%"
          icon={<Code className="h-4 w-4" />}
          trend="down"
          trendValue="-0.5% vs ayer"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de errores por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Errores por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={errorsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {errorsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencia de errores */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Errores (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={errorTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errores" fill="#ff6b6b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de errores recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Errores Recientes</CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorData.map((error) => (
              <div key={error.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(error.type)}
                      <h4 className="font-medium text-sm">{error.message}</h4>
                      <Badge className={getSeverityColor(error.severity)}>
                        {error.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Ocurrencias: {error.count}</span>
                      <span>Usuarios afectados: {error.affectedUsers}</span>
                      <span>Hace {Math.floor((Date.now() - error.lastOccurred.getTime()) / 60000)} min</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones de resolución */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-sm text-red-800 mb-1">Prioridad Alta</h4>
              <p className="text-xs text-red-700">
                Revisar errores de "Cannot read property of undefined" - afectan a múltiples usuarios.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-sm text-yellow-800 mb-1">Prioridad Media</h4>
              <p className="text-xs text-yellow-700">
                Investigar fallos de red en /api/contacts - podría ser un problema de conectividad.
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-sm text-blue-800 mb-1">Optimización</h4>
              <p className="text-xs text-blue-700">
                Implementar manejo de errores más robusto para recursos externos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
