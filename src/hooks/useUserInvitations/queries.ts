
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { UserInvitation } from './types'
import { useMemo } from 'react'

export const useUserInvitationsQuery = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['user-invitations', user?.org_id],
    queryFn: async () => {
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
    staleTime: 1000 * 60 * 3, // 3 minutos para invitaciones (datos que cambian con frecuencia)
    select: (data) => data.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      org_id: invitation.org_id,
      invited_by: invitation.invited_by,
      status: invitation.status as UserInvitation['status'],
      token: invitation.token,
      expires_at: invitation.expires_at,
      accepted_at: invitation.accepted_at,
      created_at: invitation.created_at,
      updated_at: invitation.updated_at
    })) as UserInvitation[],
    placeholderData: (previousData) => previousData ?? [],
  })
}
