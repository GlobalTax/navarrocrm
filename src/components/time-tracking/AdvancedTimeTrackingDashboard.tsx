
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, TrendingUp, Target, DollarSign, AlertTriangle, Shield } from 'lucide-react'
import { useTimeTrackingMetrics } from '@/hooks/useTimeTrackingMetrics'
import { useTimeTrackingPermissions } from '@/hooks/useTimeTrackingPermissions'
import { useApp } from '@/contexts/AppContext'

export const AdvancedTimeTrackingDashboard = () => {
  const { user } = useApp()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  
  const { accessLevel } = useTimeTrackingPermissions()
  const { overallMetrics, teamMetrics, canViewTeams } = useTimeTrackingMetrics(selectedPeriod)

  const getAccessLevelInfo = () => {
    switch (accessLevel) {
      case 'organization':
        return { label: 'Vista Organizacional', icon: Shield, color: 'text-purple-600' }
      case 'department':
        return { label: 'Vista Departamental', icon: Users, color: 'text-blue-600' }
      case 'team':
        return { label: 'Vista de Equipo', icon: Target, color: 'text-green-600' }
      case 'personal':
        return { label: 'Vista Personal', icon: Clock, color: 'text-orange-600' }
      default:
        return { label: 'Vista Personal', icon: Clock, color: 'text-gray-600' }
    }
  }

  const accessInfo = getAccessLevelInfo()

  const getMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, trend?: string) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge variant="secondary" className="text-xs">
                  {trend}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header con información de permisos */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Dashboard Avanzado</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <accessInfo.icon className={`h-4 w-4 ${accessInfo.color}`} />
            <span className="text-sm font-medium text-gray-700">{accessInfo.label}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">7 días</SelectItem>
              <SelectItem value="month">30 días</SelectItem>
            </SelectContent>
          </Select>
          
          {canViewTeams && (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los equipos</SelectItem>
                {teamMetrics.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetricCard(
          "Horas Totales",
          overallMetrics.totalHours,
          `${overallMetrics.totalEntries} registros`,
          <Clock className="h-4 w-4 text-blue-600" />,
          "+12%"
        )}
        
        {getMetricCard(
          "Horas Facturables",
          overallMetrics.billableHours,
          `${overallMetrics.utilizationRate}% utilización`,
          <DollarSign className="h-4 w-4 text-green-600" />,
          "+8%"
        )}
        
        {getMetricCard(
          "Promedio por Registro",
          `${overallMetrics.avgEntryDuration}min`,
          "Duración media",
          <Target className="h-4 w-4 text-purple-600" />
        )}
        
        {getMetricCard(
          canViewTeams ? "Equipos Activos" : "Mi Productividad",
          canViewTeams ? teamMetrics.length : "⭐⭐⭐⭐",
          canViewTeams ? "equipos supervisados" : `${overallMetrics.totalEntries} entradas`,
          <Users className="h-4 w-4 text-orange-600" />
        )}
      </div>

      {/* Métricas por equipo - Solo para usuarios con permisos */}
      {canViewTeams && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Rendimiento por Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMetrics
                .filter(team => selectedTeam === 'all' || team.id === selectedTeam)
                .map(team => (
                <div key={team.id} className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: team.color }}
                      />
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-gray-500">{team.members} miembros</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{team.hours}h</p>
                        <p className="text-xs text-gray-500">este período</p>
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          variant={team.utilization >= 80 ? "default" : team.utilization >= 60 ? "secondary" : "destructive"}
                        >
                          {team.utilization}%
                        </Badge>
                        <p className="text-xs text-gray-500">utilización</p>
                      </div>
                      
                      {team.utilization < 60 && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>

                  {/* Detalle por miembro del equipo */}
                  {accessLevel === 'organization' || accessLevel === 'department' ? (
                    <div className="ml-6 space-y-2">
                      {team.memberMetrics.map(member => (
                        <div key={member.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{member.userName}</span>
                          <div className="flex items-center gap-3 text-sm">
                            <span>{member.hours}h</span>
                            <Badge variant={member.utilization >= 80 ? "default" : "secondary"}>
                              {member.utilization}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights y recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallMetrics.utilizationRate > 80 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-900">Excelente productividad</p>
                  <p className="text-sm text-green-700">
                    La utilización de {overallMetrics.utilizationRate}% está por encima del objetivo
                  </p>
                </div>
              </div>
            )}
            
            {teamMetrics.filter(t => t.utilization < 60).length > 0 && canViewTeams && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-orange-900">Atención requerida</p>
                  <p className="text-sm text-orange-700">
                    {teamMetrics.filter(t => t.utilization < 60).length} equipo(s) con utilización por debajo del 60%
                  </p>
                </div>
              </div>
            )}
            
            {overallMetrics.totalHours > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-blue-900">Progreso registrado</p>
                  <p className="text-sm text-blue-700">
                    {overallMetrics.totalHours} horas registradas con {overallMetrics.totalEntries} entradas
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
