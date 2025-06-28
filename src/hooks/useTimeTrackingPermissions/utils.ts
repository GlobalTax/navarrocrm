
import type { TimeTrackingAccess, PermissionsContext } from './types'

export const calculatePartnerPermissions = ({ users, teams }: PermissionsContext): TimeTrackingAccess => {
  return {
    canViewAllUsers: true,
    canViewTeamMembers: true,
    canViewDepartmentTeams: true,
    visibleUserIds: users.map(u => u.id),
    visibleTeamIds: teams.map(t => t.id),
    accessLevel: 'organization'
  }
}

export const calculateAreaManagerPermissions = ({ user, memberships, users }: PermissionsContext): TimeTrackingAccess => {
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
      canViewDepartmentTeams: true,
      visibleUserIds,
      visibleTeamIds: leadTeamIds,
      accessLevel: 'department'
    }
  }

  return calculatePersonalPermissions({ user })
}

export const calculateSeniorPermissions = ({ user, memberships }: PermissionsContext): TimeTrackingAccess => {
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
      canViewDepartmentTeams: false,
      visibleUserIds,
      visibleTeamIds: leadTeamIds,
      accessLevel: 'team'
    }
  }

  return calculatePersonalPermissions({ user })
}

export const calculatePersonalPermissions = ({ user }: Pick<PermissionsContext, 'user'>): TimeTrackingAccess => {
  return {
    canViewAllUsers: false,
    canViewTeamMembers: false,
    canViewDepartmentTeams: false,
    visibleUserIds: [user.id],
    visibleTeamIds: [],
    accessLevel: 'personal'
  }
}

export const getDefaultPermissions = (): TimeTrackingAccess => {
  return {
    canViewAllUsers: false,
    canViewTeamMembers: false,
    canViewDepartmentTeams: false,
    visibleUserIds: [],
    visibleTeamIds: [],
    accessLevel: 'personal'
  }
}
