
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export const useRecurringFeesForTimer = () => {
  const { user } = useApp()

  const { data: activeFees = [] } = useQuery({
    queryKey: ['recurring-fees-timer', user?.org_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_fees')
        .select('id, name, client_id, included_hours, hourly_rate_extra, frequency, contacts:contact_id(id, name)')
        .eq('status', 'active')
        .gt('included_hours', 0)
        .order('name')

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  return { activeFees }
}
