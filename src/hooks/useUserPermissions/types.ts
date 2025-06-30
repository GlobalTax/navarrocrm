
export interface UserPermission {
  id: string
  user_id: string
  org_id: string
  module: string
  permission: string
  granted_by: string
  created_at: string
  updated_at: string
}

export interface PermissionModule {
  key: string
  label: string
  description?: string
}

export interface PermissionLevel {
  key: string
  label: string
  description?: string
}

export interface GrantPermissionParams {
  userId: string
  module: string
  permission: string
}

export interface UpdateUserRoleParams {
  userId: string
  newRole: string
}
