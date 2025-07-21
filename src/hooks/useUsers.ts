
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useMemo } from 'react'

export interface User {
  id: string
  email: string
  role: string
  org_id: string | null
  created_at: string
  updated_at: string
}

export const useUsers = () => {
  const { user } = useApp()

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', user.org_id)
        .order('email', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos para datos de usuarios
    select: (data) => data.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      created_at: user.created_at,
      updated_at: user.updated_at
    })),
    placeholderData: (previousData) => previousData ?? [],
  })

  return {
    users,
    isLoading,
    error,
  }
}
