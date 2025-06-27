
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { OfficeStats } from '@/types/office'

export const useOfficeStats = () => {
  return useQuery({
    queryKey: ['office-stats'],
    queryFn: async () => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const { data, error } = await supabase.rpc('get_office_stats', {
        org_uuid: user.data.user.user_metadata.org_id
      })

      if (error) throw error
      return data as unknown as OfficeStats
    },
    refetchInterval: 30000 // Actualizar cada 30 segundos
  })
}
