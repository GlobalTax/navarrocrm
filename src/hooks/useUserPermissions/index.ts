
import { useUserPermissionsQuery, getUserPermissions, hasPermission } from './queries'
import { useGrantPermissionMutation, useRevokePermissionMutation, useUpdateUserRoleMutation } from './mutations'
import { AVAILABLE_MODULES, PERMISSION_LEVELS } from './constants'

export type {
  UserPermission,
  PermissionModule,
  PermissionLevel,
  GrantPermissionParams,
  UpdateUserRoleParams
} from './types'

export const useUserPermissions = () => {
  const { data: permissions = [], isLoading } = useUserPermissionsQuery()
  const grantPermissionMutation = useGrantPermissionMutation()
  const revokePermissionMutation = useRevokePermissionMutation()
  const updateUserRoleMutation = useUpdateUserRoleMutation()

  return {
    permissions,
    isLoading,
    getUserPermissions: (userId: string) => getUserPermissions(permissions, userId),
    hasPermission: (userId: string, module: string, permission: string) => 
      hasPermission(permissions, userId, module, permission),
    grantPermission: grantPermissionMutation,
    revokePermission: revokePermissionMutation,
    updateUserRole: updateUserRoleMutation,
    AVAILABLE_MODULES,
    PERMISSION_LEVELS
  }
}
