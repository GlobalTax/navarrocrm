
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { Proposal } from '@/types/proposals'

export const useProposalsData = () => {
  const { user } = useApp()

  const { data: proposals = [], isLoading, error } = useQuery({
    queryKey: ['proposals', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          contact:contacts(name, email),
          line_items:proposal_line_items(*)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Proposal[]
    },
    enabled: !!user?.org_id
  })

  return {
    proposals,
    isLoading,
    error
  }
}
