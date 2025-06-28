
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { GrantPermissionParams, UpdateUserRoleParams } from './types'

export const useGrantPermissionMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, module, permission }: GrantPermissionParams) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          org_id: user.org_id,
          module,
          permission,
          granted_by: user.id
        })

      if (error) throw error

      // Registrar en auditoría
      await supabase
        .from('user_audit_log')
        .insert({
          org_id: user.org_id,
          target_user_id: userId,
          action_by: user.id,
          action_type: 'permission_grant',
          new_value: { module, permission },
          details: `Permiso otorgado: ${permission} en ${module}`
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Permiso otorgado correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error otorgando el permiso')
    },
  })
}

export const useRevokePermissionMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (permissionId: string) => {
      const { data: permissions } = await queryClient.getQueryData(['user-permissions', user?.org_id]) as { data: any[] } || { data: [] }
      const permission = permissions.find((p: any) => p.id === permissionId)
      if (!permission) throw new Error('Permiso no encontrado')

      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', permissionId)

      if (error) throw error

      // Registrar en auditoría
      await supabase
        .from('user_audit_log')
        .insert({
          org_id: user!.org_id,
          target_user_id: permission.user_id,
          action_by: user!.id,
          action_type: 'permission_revoke',
          old_value: { module: permission.module, permission: permission.permission },
          details: `Permiso revocado: ${permission.permission} en ${permission.module}`
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Permiso revocado correctamente')
    },
    onError: (error: any) => {
      toast.error('Error revocando el permiso')
    },
  })
}

export const useUpdateUserRoleMutation = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, newRole }: UpdateUserRoleParams) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      // Obtener rol anterior
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      const oldRole = currentUser?.role

      // Actualizar rol
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Registrar en auditoría
      await supabase
        .from('user_audit_log')
        .insert({
          org_id: user.org_id,
          target_user_id: userId,
          action_by: user.id,
          action_type: 'role_change',
          old_value: { role: oldRole },
          new_value: { role: newRole },
          details: `Rol cambiado de ${oldRole} a ${newRole}`
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Rol actualizado correctamente')
    },
    onError: (error: any) => {
      toast.error('Error actualizando el rol')
    },
  })
}
