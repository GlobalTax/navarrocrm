
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { Case } from './types'

export const useCasesQueries = () => {
  const { user } = useApp()

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('📁 No org_id disponible para obtener casos')
        return []
      }
      
      console.log('📁 Obteniendo casos para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(name, email),
          responsible_solicitor:users!responsible_solicitor_id(email),
          originating_solicitor:users!originating_solicitor_id(email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching cases:', error)
        throw error
      }
      
      console.log('✅ Casos obtenidos:', data?.length || 0)
      return data || []
    },
    enabled: !!user?.org_id,
  })

  return {
    cases: cases as Case[],
    isLoading,
    error,
    refetch
  }
}
