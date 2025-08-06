import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { CandidateActivity } from '@/types/features/employee-data'

export function useCandidateActivities(candidateId: string) {
  return useQuery({
    queryKey: ['candidate-activities', candidateId],
    queryFn: async () => {
      if (!candidateId) return []
      
      const { data, error } = await supabase
        .from('candidate_activities')
        .select(`
          *,
          activity_type:activity_types(*)
        `)
        .eq('candidate_id', candidateId)
        .order('activity_date', { ascending: false })
      
      if (error) throw error
      return data as CandidateActivity[]
    },
    enabled: !!candidateId,
  })
}