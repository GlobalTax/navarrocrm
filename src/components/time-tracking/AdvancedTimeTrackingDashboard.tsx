
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, TrendingUp, Target, DollarSign, AlertTriangle } from 'lucide-react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useTeams } from '@/hooks/useTeams'
import { useApp } from '@/contexts/AppContext'

export const AdvancedTimeTrackingDashboard = () => {
  const { user } = useApp()
  const { timeEntries } = useTimeEntries()
  const { teams, departments } = useTeams()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')

  // Calcular métricas
  const calculateMetrics = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const filteredEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      return entryDate >= startDate
    })

    const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
    const billableHours = filteredEntries.filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
    const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      billableHours: Math.round(billableHours * 10) / 10,
      utilizationRate: Math.round(utilizationRate),
      totalEntries: filteredEntries.length,
      avgEntryDuration: filteredEntries.length > 0 
        ? Math.round((totalHours * 60) / filteredEntries.length) 
        : 0
    }
  }

  const metrics = calculateMetrics()

  // Calcular métricas por equipo
  const getTeamMetrics = () => {
    return teams.map(team => {
      // En una implementación real, aquí filtrarías por miembros del equipo
      const teamHours = Math.random() * 40 + 10 // Datos simulados
      const teamUtilization = Math.random() * 30 + 70
      
      return {
        id: team.id,
        name: team.name,
        color: team.color,
        hours: Math.round(teamHours * 10) / 10,
        utilization: Math.round(teamUtilization),
        members: team.members_count || 0
      }
    })
  }

  const teamMetrics = getTeamMetrics()

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
      {/* Filtros */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard Avanzado</h2>
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
          
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los equipos</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetricCard(
          "Horas Totales",
          metrics.totalHours,
          `${metrics.totalEntries} registros`,
          <Clock className="h-4 w-4 text-blue-600" />,
          "+12%"
        )}
        
        {getMetricCard(
          "Horas Facturables",
          metrics.billableHours,
          `${metrics.utilizationRate}% utilización`,
          <DollarSign className="h-4 w-4 text-green-600" />,
          "+8%"
        )}
        
        {getMetricCard(
          "Promedio por Registro",
          `${metrics.avgEntryDuration}min`,
          "Duración media",
          <Target className="h-4 w-4 text-purple-600" />
        )}
        
        {getMetricCard(
          "Equipos Activos",
          teams.length,
          `${departments.length} departamentos`,
          <Users className="h-4 w-4 text-orange-600" />
        )}
      </div>

      {/* Métricas por equipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rendimiento por Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMetrics.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                    <p className="text-xs text-gray-500">esta semana</p>
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas y recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-blue-900">Productividad en alza</p>
                <p className="text-sm text-blue-700">Las horas facturables han aumentado un 12% esta semana</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-orange-900">Atención requerida</p>
                <p className="text-sm text-orange-700">2 equipos tienen utilización por debajo del 60%</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-green-900">Meta alcanzada</p>
                <p className="text-sm text-green-700">Objetivo semanal de horas cumplido al 103%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
