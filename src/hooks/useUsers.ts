
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface User {
  id: string
  email: string
  role: string
  org_id: string | null
  created_at: string
  updated_at: string
}

export const useUsers = () => {
  const { user } = useAuth()

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
  })

  return {
    users,
    isLoading,
    error,
  }
}
