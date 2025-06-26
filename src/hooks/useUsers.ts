
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface User {
  id: string
  email: string
  role: string
  org_id: string | null
  created_at: string
  updated_at: string
  is_active?: boolean
}

export const useUsers = () => {
  const { user } = useApp()

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      console.log('🔍 [useUsers] Consultando usuarios para org_id:', user.org_id)
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, org_id, created_at, updated_at, is_active')
        .eq('org_id', user.org_id)
        .order('email', { ascending: true })

      if (error) {
        console.error('❌ [useUsers] Error en consulta:', error)
        throw error
      }
      
      console.log('✅ [useUsers] Usuarios obtenidos:', data?.length || 0)
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
