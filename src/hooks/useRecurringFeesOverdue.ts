import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export const useRecurringFeesOverdue = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['recurring-fees-overdue', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return 0

      const { data, error } = await supabase
        .from('recurring_fees')
        .select('id, next_billing_date')
        .eq('org_id', user.org_id)
        .eq('status', 'active')
        .lt('next_billing_date', new Date().toISOString())

      if (error) throw error
      
      return data?.length || 0
    },
    enabled: !!user?.org_id,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000 // Consider stale after 2 minutes
  })
}