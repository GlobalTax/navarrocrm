
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface PermissionGroupItem {
  id: string
  group_id: string
  module: string
  permission: string
}

export interface PermissionGroup {
  id: string
  org_id: string
  name: string
  description: string | null
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  items: PermissionGroupItem[]
}

export const usePermissionGroups = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const orgId = user?.org_id

  const groupsQuery = useQuery({
    queryKey: ['permission-groups', orgId],
    queryFn: async (): Promise<PermissionGroup[]> => {
      if (!orgId) return []

      const { data: groups, error } = await supabase
        .from('permission_groups')
        .select('*')
        .eq('org_id', orgId)
        .order('is_system', { ascending: false })
        .order('name')

      if (error) throw error

      const { data: items, error: itemsError } = await supabase
        .from('permission_group_items')
        .select('*')
        .in('group_id', (groups || []).map(g => g.id))

      if (itemsError) throw itemsError

      return (groups || []).map(g => ({
        ...g,
        items: (items || []).filter(i => i.group_id === g.id)
      }))
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  })

  const createGroup = useMutation({
    mutationFn: async (params: { name: string; description: string; items: { module: string; permission: string }[] }) => {
      if (!orgId) throw new Error('No org')

      const { data: group, error } = await supabase
        .from('permission_groups')
        .insert({ org_id: orgId, name: params.name, description: params.description, created_by: user?.id })
        .select()
        .single()

      if (error) throw error

      if (params.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('permission_group_items')
          .insert(params.items.map(i => ({ group_id: group.id, module: i.module, permission: i.permission })))

        if (itemsError) throw itemsError
      }

      return group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
      toast.success('Grupo de permisos creado')
    },
    onError: (e: any) => toast.error('Error: ' + e.message),
  })

  const updateGroup = useMutation({
    mutationFn: async (params: { id: string; name: string; description: string; items: { module: string; permission: string }[] }) => {
      const { error } = await supabase
        .from('permission_groups')
        .update({ name: params.name, description: params.description })
        .eq('id', params.id)

      if (error) throw error

      // Replace all items
      await supabase.from('permission_group_items').delete().eq('group_id', params.id)

      if (params.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('permission_group_items')
          .insert(params.items.map(i => ({ group_id: params.id, module: i.module, permission: i.permission })))

        if (itemsError) throw itemsError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
      toast.success('Grupo actualizado')
    },
    onError: (e: any) => toast.error('Error: ' + e.message),
  })

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('permission_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
      toast.success('Grupo eliminado')
    },
    onError: (e: any) => toast.error('Error: ' + e.message),
  })

  const applyGroupToUser = useMutation({
    mutationFn: async (params: { userId: string; groupId: string }) => {
      if (!orgId) throw new Error('No org')

      // Get group items
      const { data: items, error: itemsError } = await supabase
        .from('permission_group_items')
        .select('module, permission')
        .eq('group_id', params.groupId)

      if (itemsError) throw itemsError
      if (!items || items.length === 0) throw new Error('El grupo no tiene permisos')

      // Insert permissions (upsert to avoid duplicates)
      const permissionsToInsert = items.map(i => ({
        user_id: params.userId,
        org_id: orgId,
        module: i.module,
        permission: i.permission,
        granted_by: user?.id || '',
      }))

      // Delete existing permissions for this user first, then insert
      for (const perm of permissionsToInsert) {
        await supabase
          .from('user_permissions')
          .upsert(perm, { onConflict: 'user_id,module,permission' })
      }

      // Track the group assignment
      await supabase
        .from('user_permission_groups')
        .upsert({
          user_id: params.userId,
          group_id: params.groupId,
          org_id: orgId,
          assigned_by: user?.id,
        }, { onConflict: 'user_id,group_id' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
      toast.success('Grupo de permisos aplicado al usuario')
    },
    onError: (e: any) => toast.error('Error: ' + e.message),
  })

  const applyGroupToMultipleUsers = useMutation({
    mutationFn: async (params: { userIds: string[]; groupId: string; onProgress?: (current: number, total: number) => void }) => {
      if (!orgId) throw new Error('No org')

      const { data: items, error: itemsError } = await supabase
        .from('permission_group_items')
        .select('module, permission')
        .eq('group_id', params.groupId)

      if (itemsError) throw itemsError
      if (!items || items.length === 0) throw new Error('El grupo no tiene permisos')

      let completed = 0
      const errors: string[] = []

      for (const userId of params.userIds) {
        try {
          const permissionsToInsert = items.map(i => ({
            user_id: userId,
            org_id: orgId,
            module: i.module,
            permission: i.permission,
            granted_by: user?.id || '',
          }))

          for (const perm of permissionsToInsert) {
            await supabase
              .from('user_permissions')
              .upsert(perm, { onConflict: 'user_id,module,permission' })
          }

          await supabase
            .from('user_permission_groups')
            .upsert({
              user_id: userId,
              group_id: params.groupId,
              org_id: orgId,
              assigned_by: user?.id,
            }, { onConflict: 'user_id,group_id' })

          completed++
          params.onProgress?.(completed, params.userIds.length)
        } catch (e: any) {
          errors.push(userId)
          completed++
          params.onProgress?.(completed, params.userIds.length)
        }
      }

      if (errors.length > 0) {
        throw new Error(`Falló en ${errors.length} de ${params.userIds.length} usuarios`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
    },
    onError: (e: any) => toast.error('Error: ' + e.message),
  })

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    createGroup,
    updateGroup,
    deleteGroup,
    applyGroupToUser,
    applyGroupToMultipleUsers,
  }
}
