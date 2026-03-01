
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
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
  })
}

export const getUserPermissions = (permissions: UserPermission[], userId: string): UserPermission[] => {
  return permissions.filter(permission => permission.user_id === userId)
}

export const hasPermission = (
  permissions: UserPermission[], 
  userId: string, 
  module: string, 
  permission: string
): boolean => {
  return permissions.some(p => 
    p.user_id === userId && 
    p.module === module && 
    p.permission === permission
  )
}
