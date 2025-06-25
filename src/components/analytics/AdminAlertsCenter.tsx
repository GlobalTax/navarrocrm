
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAlertsManager } from '@/hooks/analytics/useAlertsManager'
import { AlertTriangle, CheckCircle, Clock, Bell, Settings, Filter } from 'lucide-react'
import { Alert } from '@/services/analytics/AlertsManager'

export const AdminAlertsCenter: React.FC = () => {
  const { alerts, activeAlerts, criticalAlerts, resolveAlert, activeAlertsCount, criticalAlertsCount } = useAlertsManager()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'  
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Clock className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      case 'security': return <Settings className="h-4 w-4" />
      case 'business': return <Bell className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filterAlerts = (alertsList: Alert[]) => {
    return alertsList.filter(alert => {
      const typeMatch = filterType === 'all' || alert.type === filterType
      const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity
      return typeMatch && severityMatch
    })
  }

  const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => (
    <Card className={`transition-all hover:shadow-md ${alert.severity === 'critical' ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-white rounded-lg border">
              {getTypeIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>{formatTimestamp(alert.timestamp)}</span>
                <span>Valor: {alert.currentValue.toFixed(2)}</span>
                <span>Umbral: {alert.threshold}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!alert.resolved ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => resolveAlert(alert.id)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolver
              </Button>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✓ Resuelto
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlertsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlertsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeAlerts.filter(a => a.type === 'performance').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeAlerts.filter(a => a.type === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de alerta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="error">Errores</SelectItem>
                <SelectItem value="security">Seguridad</SelectItem>
                <SelectItem value="business">Negocio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las severidades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de alertas */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Activas ({activeAlertsCount})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Críticas ({criticalAlertsCount})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filterAlerts(activeAlerts).length > 0 ? (
            filterAlerts(activeAlerts).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p>No hay alertas activas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {filterAlerts(criticalAlerts).length > 0 ? (
            filterAlerts(criticalAlerts).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p>No hay alertas críticas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filterAlerts(alerts).length > 0 ? (
            filterAlerts(alerts).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay alertas que mostrar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
