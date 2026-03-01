
export interface TimeTrackingAccess {
  canViewAllUsers: boolean
  canViewTeamMembers: boolean
  canViewDepartmentTeams: boolean
  visibleUserIds: string[]
  visibleTeamIds: string[]
  accessLevel: 'personal' | 'team' | 'department' | 'organization'
  // Shared data to avoid redundant hook calls
  teams: any[]
  memberships: any[]
  users: any[]
}

export interface PermissionsContext {
  user: any
  teams: any[]
  memberships: any[]
  users: any[]
}
