
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { Proposal } from '@/types/proposals'
import { useMemo } from 'react'

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
          contact:contacts!proposals_contact_id_fkey(id, name, email, phone, dni_nif),
          line_items:proposal_line_items(*)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching proposals:', error)
        throw error
      }
      
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 5, // 5 minutos para propuestas
    select: (data) => {
      return data.map(proposal => ({
        ...proposal,
        client_id: proposal.contact_id,
        client: proposal.contact && proposal.contact.id ? proposal.contact : {
          id: proposal.contact_id,
          name: 'Cliente no encontrado',
          email: null
        }
      })) as Proposal[]
    },
    placeholderData: (previousData) => previousData ?? [],
  })

  return {
    proposals,
    isLoading,
    error
  }
}
