
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { UserInvitation } from './types'

export const useUserInvitationsQuery = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['user-invitations', user?.org_id],
    queryFn: async (): Promise<UserInvitation[]> => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })
}
