import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { CandidateEvaluation } from '@/types/features/employee-data'

export function useCandidateEvaluations(candidateId: string) {
  return useQuery({
    queryKey: ['candidate-evaluations', candidateId],
    queryFn: async () => {
      if (!candidateId) return []
      
      const { data, error } = await supabase
        .from('candidate_evaluations')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('evaluation_date', { ascending: false })
      
      if (error) throw error
      return data as CandidateEvaluation[]
    },
    enabled: !!candidateId,
  })
}