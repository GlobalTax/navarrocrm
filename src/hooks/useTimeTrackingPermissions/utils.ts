
import type { TimeTrackingAccess, PermissionsContext } from './types'

const withContext = (access: Omit<TimeTrackingAccess, 'teams' | 'memberships' | 'users'>, ctx: Partial<PermissionsContext>): TimeTrackingAccess => ({
  ...access,
  teams: ctx.teams || [],
  memberships: ctx.memberships || [],
  users: ctx.users || [],
})

export const calculatePartnerPermissions = (ctx: PermissionsContext): TimeTrackingAccess => {
  return withContext({
    canViewAllUsers: true,
    canViewTeamMembers: true,
    canViewDepartmentTeams: true,
    visibleUserIds: ctx.users.map(u => u.id),
    visibleTeamIds: ctx.teams.map(t => t.id),
    accessLevel: 'organization'
  }, ctx)
}

export const calculateAreaManagerPermissions = (ctx: PermissionsContext): TimeTrackingAccess => {
  const { user, memberships } = ctx
  const userLeaderships = memberships.filter(
    m => m.user_id === user.id && (m.role === 'lead' || m.role === 'coordinator')
  )

  if (userLeaderships.length > 0) {
    const leadTeamIds = userLeaderships.map(l => l.team_id)
    const teamMemberIds = memberships
      .filter(m => leadTeamIds.includes(m.team_id) && m.is_active)
      .map(m => m.user_id)
    const visibleUserIds = [...new Set([user.id, ...teamMemberIds])]

    return withContext({
      canViewAllUsers: false,
      canViewTeamMembers: true,
      canViewDepartmentTeams: true,
      visibleUserIds,
      visibleTeamIds: leadTeamIds,
      accessLevel: 'department'
    }, ctx)
  }

  return calculatePersonalPermissions(ctx)
}

export const calculateSeniorPermissions = (ctx: PermissionsContext): TimeTrackingAccess => {
  const { user, memberships } = ctx
  const userLeaderships = memberships.filter(
    m => m.user_id === user.id && (m.role === 'lead' || m.role === 'coordinator')
  )

  if (userLeaderships.length > 0) {
    const leadTeamIds = userLeaderships.map(l => l.team_id)
    const teamMemberIds = memberships
      .filter(m => leadTeamIds.includes(m.team_id) && m.is_active)
      .map(m => m.user_id)
    const visibleUserIds = [...new Set([user.id, ...teamMemberIds])]

    return withContext({
      canViewAllUsers: false,
      canViewTeamMembers: true,
      canViewDepartmentTeams: false,
      visibleUserIds,
      visibleTeamIds: leadTeamIds,
      accessLevel: 'team'
    }, ctx)
  }

  return calculatePersonalPermissions(ctx)
}

export const calculatePersonalPermissions = (ctx: Partial<PermissionsContext> & { user: any }): TimeTrackingAccess => {
  return withContext({
    canViewAllUsers: false,
    canViewTeamMembers: false,
    canViewDepartmentTeams: false,
    visibleUserIds: [ctx.user.id],
    visibleTeamIds: [],
    accessLevel: 'personal'
  }, ctx)
}

export const getDefaultPermissions = (): TimeTrackingAccess => {
  return {
    canViewAllUsers: false,
    canViewTeamMembers: false,
    canViewDepartmentTeams: false,
    visibleUserIds: [],
    visibleTeamIds: [],
    accessLevel: 'personal',
    teams: [],
    memberships: [],
    users: [],
  }
}
