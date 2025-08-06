import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { CandidateReference } from '@/types/features/employee-data'

export function useCandidateReferences(candidateId: string) {
  return useQuery({
    queryKey: ['candidate-references', candidateId],
    queryFn: async () => {
      if (!candidateId) return []
      
      const { data, error } = await supabase
        .from('candidate_references')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as CandidateReference[]
    },
    enabled: !!candidateId,
  })
}