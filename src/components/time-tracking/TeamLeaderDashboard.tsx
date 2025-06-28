
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Clock, Target, TrendingUp, AlertCircle } from 'lucide-react'
import { useTimeTrackingMetrics } from '@/hooks/useTimeTrackingMetrics'
import { useTimeTrackingPermissions } from '@/hooks/useTimeTrackingPermissions'

interface TeamLeaderDashboardProps {
  selectedPeriod?: string
}

export const TeamLeaderDashboard = ({ selectedPeriod = 'week' }: TeamLeaderDashboardProps) => {
  const { accessLevel } = useTimeTrackingPermissions()
  const { teamMetrics, overallMetrics } = useTimeTrackingMetrics(selectedPeriod)

  if (accessLevel === 'personal') {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Vista de Líder de Equipo</h3>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Horas Totales</span>
            </div>
            <p className="text-2xl font-bold">{overallMetrics.totalHours}h</p>
            <p className="text-sm text-gray-500">en {selectedPeriod === 'today' ? 'hoy' : selectedPeriod === 'week' ? '7 días' : '30 días'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Utilización</span>
            </div>
            <p className="text-2xl font-bold">{overallMetrics.utilizationRate}%</p>
            <Progress value={overallMetrics.utilizationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Equipos</span>
            </div>
            <p className="text-2xl font-bold">{teamMetrics.length}</p>
            <p className="text-sm text-gray-500">bajo supervisión</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle por equipo */}
      <div className="space-y-4">
        {teamMetrics.map(team => (
          <Card key={team.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: team.color }}
                  />
                  {team.name}
                </CardTitle>
                <Badge variant={team.utilization >= 80 ? "default" : team.utilization >= 60 ? "secondary" : "destructive"}>
                  {team.utilization}% utilización
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Horas del equipo</p>
                  <p className="text-xl font-semibold">{team.hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Miembros activos</p>
                  <p className="text-xl font-semibold">{team.members}</p>
                </div>
              </div>

              {/* Lista de miembros */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Rendimiento por miembro:</h4>
                {team.memberMetrics.map(member => (
                  <div key={member.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.userName}</span>
                      {member.utilization < 50 && (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">{member.hours}h</span>
                      <span className="text-gray-600">({member.billableHours}h fact.)</span>
                      <Badge 
                        variant={member.utilization >= 80 ? "default" : member.utilization >= 60 ? "secondary" : "destructive"}
                      >
                        {member.utilization}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alertas del equipo */}
              {team.utilization < 60 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">Atención requerida</p>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    La utilización del equipo está por debajo del objetivo (60%). 
                    Considera revisar la asignación de tareas o la carga de trabajo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recomendaciones para tu equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMetrics.some(t => t.utilization > 90) && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">💡 Alta productividad detectada</p>
                <p className="text-sm text-blue-700">
                  Algunos miembros tienen muy alta utilización. Considera balancear la carga de trabajo.
                </p>
              </div>
            )}
            
            {teamMetrics.some(t => t.utilization < 50) && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-900">⚠️ Baja utilización</p>
                <p className="text-sm text-orange-700">
                  Algunos equipos tienen baja utilización. Revisa la asignación de tareas y proyectos.
                </p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900">📊 Seguimiento regular</p>
              <p className="text-sm text-green-700">
                Mantén reuniones semanales de seguimiento para optimizar la productividad del equipo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
