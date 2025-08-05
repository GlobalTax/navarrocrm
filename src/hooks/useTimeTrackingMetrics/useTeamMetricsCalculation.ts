
import { useMemo } from 'react'
import type { TimeEntry } from '@/hooks/useTimeEntries'
import type { TeamMetrics, TeamMemberMetrics } from './types'

interface UseTeamMetricsCalculationProps {
  filteredTimeEntries: TimeEntry[]
  teams: any[]
  visibleTeamIds: string[]
  memberships: any[]
  visibleUserIds: string[]
  users: any[]
  accessLevel: string
}

export const useTeamMetricsCalculation = ({
  filteredTimeEntries,
  teams,
  visibleTeamIds,
  memberships,
  visibleUserIds,
  users,
  accessLevel
}: UseTeamMetricsCalculationProps): TeamMetrics[] => {
  return useMemo(() => {
    if (accessLevel === 'personal') {
      return []
    }

    return teams
      .filter(team => visibleTeamIds.includes(team.id))
      .map(team => {
        // Obtener miembros del equipo
        const teamMemberIds = memberships
          .filter(m => m.team_id === team.id && m.is_active)
          .map(m => m.user_id)
          .filter(userId => visibleUserIds.includes(userId))

        // Calcular métricas del equipo
        const teamEntries = filteredTimeEntries.filter(entry => 
          teamMemberIds.includes(entry.user_id)
        )

        const teamHours = teamEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
        const teamBillableHours = teamEntries
          .filter(entry => entry.is_billable)
          .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
        const teamUtilization = teamHours > 0 ? (teamBillableHours / teamHours) * 100 : 0

        // Métricas por miembro
        const memberMetrics: TeamMemberMetrics[] = teamMemberIds.map(userId => {
          const user = users.find(u => u.id === userId)
          const userEntries = teamEntries.filter(entry => entry.user_id === userId)
          const userHours = userEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
          const userBillableHours = userEntries
            .filter(entry => entry.is_billable)
            .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
          const userUtilization = userHours > 0 ? (userBillableHours / userHours) * 100 : 0

          return {
            userId,
            userName: user?.email.split('@')[0] || 'Usuario',
            hours: Math.round(userHours * 10) / 10,
            billableHours: Math.round(userBillableHours * 10) / 10,
            utilization: Math.round(userUtilization)
          }
        })

        return {
          id: team.id,
          name: team.name,
          color: team.color || '#6366f1',
          hours: Math.round(teamHours * 10) / 10,
          utilization: Math.round(teamUtilization),
          members: teamMemberIds.length,
          memberMetrics
        }
      })
  }, [filteredTimeEntries, teams, visibleTeamIds, memberships, visibleUserIds, users, accessLevel])
}
