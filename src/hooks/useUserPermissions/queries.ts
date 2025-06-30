
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { UserPermission } from './types'

export const useUserPermissionsQuery = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['user-permissions', user?.org_id],
    queryFn: async (): Promise<UserPermission[]> => {
      if (!user?.org_id) return []
      
      console.log('🔍 [UserPermissions] Consultando permisos para org:', user.org_id)
      
      try {
        // Consulta simplificada sin foreign key hints para evitar errores 400
        const { data: permissions, error } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [UserPermissions] Error en consulta base:', error)
          throw error
        }

        if (!permissions || permissions.length === 0) {
          console.log('ℹ️ [UserPermissions] No se encontraron permisos')
          return []
        }

        // Obtener información de usuarios por separado para evitar problemas de foreign key
        const userIds = [...new Set([
          ...permissions.map(p => p.user_id),
          ...permissions.map(p => p.granted_by).filter(Boolean)
        ])]

        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds)

        if (usersError) {
          console.warn('⚠️ [UserPermissions] Error obteniendo usuarios, continuando sin emails:', usersError)
        }

        // Mapear usuarios por ID para fácil acceso
        const userMap = new Map(users?.map(u => [u.id, u]) || [])

        // Enriquecer permisos con información de usuarios
        const enrichedPermissions = permissions.map(permission => ({
          ...permission,
          user: userMap.get(permission.user_id) || null,
          granted_by_user: permission.granted_by ? userMap.get(permission.granted_by) || null : null
        }))

        console.log('✅ [UserPermissions] Permisos obtenidos exitosamente:', enrichedPermissions.length)
        return enrichedPermissions
      } catch (error) {
        console.error('❌ [UserPermissions] Error crítico:', error)
        throw error
      }
    },
    enabled: !!user?.org_id,
  })
}

export const getUserPermissions = (permissions: UserPermission[], userId: string) => {
  return permissions.filter(p => p.user_id === userId)
}

export const hasPermission = (permissions: UserPermission[], userId: string, module: string, permission: string) => {
  return permissions.some(p => 
    p.user_id === userId && 
    p.module === module && 
    (p.permission === permission || p.permission === 'admin')
  )
}
