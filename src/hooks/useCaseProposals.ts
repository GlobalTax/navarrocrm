import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export const useCaseProposals = (caseId: string) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['case-proposals', caseId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id || !caseId) return []

      // First get the case to get contact_id
      const { data: caseData } = await supabase
        .from('cases')
        .select('contact_id, title')
        .eq('id', caseId)
        .single()

      if (!caseData?.contact_id) return []

      // Then get proposals for this contact
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          contact:contacts!proposals_contact_id_fkey(id, name),
          line_items:proposal_line_items(*)
        `)
        .eq('org_id', user.org_id)
        .eq('contact_id', caseData.contact_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id && !!caseId,
  })
}