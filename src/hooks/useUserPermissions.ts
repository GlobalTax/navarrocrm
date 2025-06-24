
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

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

export const AVAILABLE_MODULES = [
  { key: 'cases', label: 'Casos' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'proposals', label: 'Propuestas' },
  { key: 'time_tracking', label: 'Control de Tiempo' },
  { key: 'reports', label: 'Reportes' },
  { key: 'users', label: 'Gestión de Usuarios' },
  { key: 'integrations', label: 'Integraciones' },
  { key: 'billing', label: 'Facturación' }
] as const

export const PERMISSION_LEVELS = [
  { key: 'read', label: 'Lectura' },
  { key: 'write', label: 'Escritura' },
  { key: 'delete', label: 'Eliminación' },
  { key: 'admin', label: 'Administración' }
] as const

export const useUserPermissions = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          user:users!user_permissions_user_id_fkey(email),
          granted_by_user:users!user_permissions_granted_by_fkey(email)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const getUserPermissions = (userId: string) => {
    return permissions.filter(p => p.user_id === userId)
  }

  const hasPermission = (userId: string, module: string, permission: string) => {
    return permissions.some(p => 
      p.user_id === userId && 
      p.module === module && 
      (p.permission === permission || p.permission === 'admin')
    )
  }

  const grantPermission = useMutation({
    mutationFn: async ({ userId, module, permission }: { 
      userId: string; 
      module: string; 
      permission: string 
    }) => {
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

  const revokePermission = useMutation({
    mutationFn: async (permissionId: string) => {
      const permission = permissions.find(p => p.id === permissionId)
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

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
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

  return {
    permissions,
    isLoading,
    getUserPermissions,
    hasPermission,
    grantPermission,
    revokePermission,
    updateUserRole,
    AVAILABLE_MODULES,
    PERMISSION_LEVELS
  }
}
