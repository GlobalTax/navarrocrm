
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
