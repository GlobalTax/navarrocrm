
export interface TimeTrackingAccess {
  canViewAllUsers: boolean
  canViewTeamMembers: boolean
  canViewDepartmentTeams: boolean
  visibleUserIds: string[]
  visibleTeamIds: string[]
  accessLevel: 'personal' | 'team' | 'department' | 'organization'
}

export interface PermissionsContext {
  user: any
  teams: any[]
  memberships: any[]
  users: any[]
}
