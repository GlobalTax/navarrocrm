
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { Case } from './types'

export const useCasesQueries = () => {
  const { user } = useApp()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cases', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        console.log('📋 No org_id disponible para obtener casos')
        return []
      }
      
      console.log('📋 Obteniendo casos para org:', user.org_id)
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          contact:contacts(
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching cases:', error)
        throw error
      }
      
      console.log('✅ Casos obtenidos:', data?.length || 0)
      return (data || []) as unknown as Case[]
    },
    enabled: !!user?.org_id,
  })

  // Memoizar el array cases para evitar recreaciones innecesarias
  const cases = useMemo(() => data || [], [data])

  return {
    cases,
    isLoading,
    error,
    refetch
  }
}
