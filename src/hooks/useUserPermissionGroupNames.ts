import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export const useUserPermissionGroupNames = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['user-permission-group-names', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permission_groups')
        .select('user_id, permission_groups(name)')
        .eq('org_id', user!.org_id)

      if (error) throw error

      const map: Record<string, string> = {}
      for (const row of data || []) {
        const group = row.permission_groups as any
        if (group?.name) {
          map[row.user_id] = group.name
        }
      }
      return map
    },
    enabled: !!user?.org_id
  })
}
