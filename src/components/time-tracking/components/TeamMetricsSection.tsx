
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, AlertTriangle } from 'lucide-react'

interface TeamMetricsSectionProps {
  canViewTeams: boolean
  teamMetrics: any[]
  selectedTeam: string
  accessLevel: string
}

export const TeamMetricsSection = ({ 
  canViewTeams, 
  teamMetrics, 
  selectedTeam, 
  accessLevel 
}: TeamMetricsSectionProps) => {
  if (!canViewTeams) return null

  return (
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
              {(accessLevel === 'organization' || accessLevel === 'department') && (
                <div className="ml-6 space-y-2">
                  {team.memberMetrics.map((member: any) => (
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
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
