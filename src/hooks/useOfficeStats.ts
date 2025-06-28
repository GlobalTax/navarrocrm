
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { OfficeStats } from '@/types/office'

export const useOfficeStats = () => {
  return useQuery({
    queryKey: ['office-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_office_stats', {
        org_uuid: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id
      })

      if (error) throw error
      
      // Safely convert to OfficeStats with type assertion
      return data as unknown as OfficeStats
    },
    refetchInterval: 30000 // Actualizar cada 30 segundos
  })
}
