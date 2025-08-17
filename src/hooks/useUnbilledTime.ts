import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface UnbilledTimeEntry {
  id: string
  description: string | null
  duration_minutes: number
  entry_type: string
  billing_status: 'unbilled' | 'billed' | 'invoiced'
  created_at: string
  user_id: string
  case_id: string
}

export const useUnbilledTime = (caseId?: string) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['unbilled-time', caseId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_billable', true)
        .eq('billing_status', 'unbilled')

      if (caseId) {
        query = query.eq('case_id', caseId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data as UnbilledTimeEntry[]
    },
    enabled: !!user?.org_id,
  })
}