
import { Shield, Users, Target, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DashboardHeaderProps {
  accessLevel: string
  selectedPeriod: string
  selectedTeam: string
  canViewTeams: boolean
  teamMetrics: any[]
  onPeriodChange: (period: string) => void
  onTeamChange: (team: string) => void
}

export const DashboardHeader = ({
  accessLevel,
  selectedPeriod,
  selectedTeam,
  canViewTeams,
  teamMetrics,
  onPeriodChange,
  onTeamChange
}: DashboardHeaderProps) => {
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

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Dashboard Avanzado</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <accessInfo.icon className={`h-4 w-4 ${accessInfo.color}`} />
          <span className="text-sm font-medium text-gray-700">{accessInfo.label}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
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
          <Select value={selectedTeam} onValueChange={onTeamChange}>
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
  )
}
