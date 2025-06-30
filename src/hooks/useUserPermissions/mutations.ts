
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

      const { data, error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          org_id: user.org_id,
          module,
          permission,
          granted_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Permiso otorgado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error otorgando permiso:', error)
      toast.error('Error otorgando el permiso')
    },
  })
}

export const useRevokePermissionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (permissionId: string) => {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', permissionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Permiso revocado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error revocando permiso:', error)
      toast.error('Error revocando el permiso')
    },
  })
}

export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, newRole }: UpdateUserRoleParams) => {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      toast.success('Rol actualizado exitosamente')
    },
    onError: (error: any) => {
      console.error('Error actualizando rol:', error)
      toast.error('Error actualizando el rol del usuario')
    },
  })
}
