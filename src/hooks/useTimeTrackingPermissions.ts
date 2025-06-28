
import { useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useTeams } from '@/hooks/useTeams'
import { useUsers } from '@/hooks/useUsers'

export interface TimeTrackingAccess {
  canViewAllUsers: boolean
  canViewTeamMembers: boolean
  canViewDepartmentTeams: boolean
  visibleUserIds: string[]
  visibleTeamIds: string[]
  accessLevel: 'personal' | 'team' | 'department' | 'organization'
}

export const useTimeTrackingPermissions = (): TimeTrackingAccess => {
  const { user } = useApp()
  const { teams, memberships } = useTeams()
  const { users } = useUsers()

  return useMemo(() => {
    if (!user) {
      return {
        canViewAllUsers: false,
        canViewTeamMembers: false,
        canViewDepartmentTeams: false,
        visibleUserIds: [],
        visibleTeamIds: [],
        accessLevel: 'personal'
      }
    }

    // Super Admin - ve todo
    if (user.role === 'partner' || user.role === 'super_admin') {
      return {
        canViewAllUsers: true,
        canViewTeamMembers: true,
        canViewDepartmentTeams: true,
        visibleUserIds: users.map(u => u.id),
        visibleTeamIds: teams.map(t => t.id),
        accessLevel: 'organization'
      }
    }

    // Encontrar equipos donde el usuario es líder
    const userLeaderships = memberships.filter(
      m => m.user_id === user.id && (m.role === 'lead' || m.role === 'coordinator')
    )

    if (userLeaderships.length > 0) {
      const leadTeamIds = userLeaderships.map(l => l.team_id)
      
      // Obtener todos los miembros de los equipos que lidera
      const teamMemberIds = memberships
        .filter(m => leadTeamIds.includes(m.team_id) && m.is_active)
        .map(m => m.user_id)
      
      // Incluir al propio usuario
      const visibleUserIds = [...new Set([user.id, ...teamMemberIds])]

      return {
        canViewAllUsers: false,
        canViewTeamMembers: true,
        canViewDepartmentTeams: userLeaderships.some(l => l.role === 'coordinator'),
        visibleUserIds,
        visibleTeamIds: leadTeamIds,
        accessLevel: userLeaderships.some(l => l.role === 'coordinator') ? 'department' : 'team'
      }
    }

    // Usuario regular - solo ve sus propias horas
    return {
      canViewAllUsers: false,
      canViewTeamMembers: false,
      canViewDepartmentTeams: false,
      visibleUserIds: [user.id],
      visibleTeamIds: [],
      accessLevel: 'personal'
    }
  }, [user, teams, memberships, users])
}
