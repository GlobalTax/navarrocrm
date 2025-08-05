
import { useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useTimeTrackingPermissions } from '@/hooks/useTimeTrackingPermissions'
import { useTeams } from '@/hooks/useTeams'
import { useUsers } from '@/hooks/useUsers'

export interface TimeMetrics {
  totalHours: number
  billableHours: number
  utilizationRate: number
  totalEntries: number
  avgEntryDuration: number
}

export interface TeamMetrics {
  id: string
  name: string
  color: string
  hours: number
  utilization: number
  members: number
  memberMetrics: Array<{
    userId: string
    userName: string
    hours: number
    billableHours: number
    utilization: number
  }>
}

export const useTimeTrackingMetrics = (selectedPeriod: string = 'week') => {
  const { timeEntries } = useTimeEntries()
  const { visibleUserIds, visibleTeamIds, accessLevel } = useTimeTrackingPermissions()
  const { teams, memberships } = useTeams()
  const { users } = useUsers()

  const filteredTimeEntries = useMemo(() => {
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

    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      const isInPeriod = entryDate >= startDate
      const hasPermission = visibleUserIds.includes(entry.user_id)
      
      return isInPeriod && hasPermission
    })
  }, [timeEntries, selectedPeriod, visibleUserIds])

  const overallMetrics: TimeMetrics = useMemo(() => {
    const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
    const billableHours = filteredTimeEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0)
    const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      billableHours: Math.round(billableHours * 10) / 10,
      utilizationRate: Math.round(utilizationRate),
      totalEntries: filteredTimeEntries.length,
      avgEntryDuration: filteredTimeEntries.length > 0 
        ? Math.round((totalHours * 60) / filteredTimeEntries.length) 
        : 0
    }
  }, [filteredTimeEntries])

  const teamMetrics: TeamMetrics[] = useMemo(() => {
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
        const memberMetrics = teamMemberIds.map(userId => {
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
  }, [teams, visibleTeamIds, memberships, visibleUserIds, filteredTimeEntries, users, accessLevel])

  return {
    overallMetrics,
    teamMetrics,
    accessLevel,
    canViewTeams: accessLevel !== 'personal'
  }
}
