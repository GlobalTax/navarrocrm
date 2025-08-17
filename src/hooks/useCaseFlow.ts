import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useTimeEntries } from './useTimeEntries'
import { useProposalsData } from './useProposalsData'

export interface CaseFlowStatus {
  hasProposal: boolean
  hasAcceptedProposal: boolean
  hasRecurringFees: boolean
  unbilledHours: number
  unbilledEntries: number
  flowState: 'no_proposal' | 'proposal_pending' | 'proposal_accepted' | 'has_recurring' | 'ready_to_bill'
}

export const useCaseFlow = (caseId: string) => {
  const { user } = useApp()
  const { timeEntries } = useTimeEntries()
  const { proposals } = useProposalsData()

  // Get unbilled time entries for this case  
  const unbilledEntries = timeEntries.filter(entry => 
    entry.case_id === caseId && 
    entry.is_billable &&
    entry.billing_status === 'unbilled'
  )

  const unbilledHours = unbilledEntries.reduce((total, entry) => 
    total + (entry.duration_minutes / 60), 0
  )

  // Get proposals for this case (checking for case_id or contact_id match)
  const { data: caseProposals = [] } = useQuery({
    queryKey: ['case-proposals', caseId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      // First get the case to get contact_id
      const { data: caseData } = await supabase
        .from('cases')
        .select('contact_id')
        .eq('id', caseId)
        .single()

      if (!caseData?.contact_id) return []

      // Then get proposals for this contact
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('contact_id', caseData.contact_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id && !!caseId,
  })

  // Get recurring fees for accepted proposals
  const { data: recurringFees = [] } = useQuery({
    queryKey: ['case-recurring-fees', caseId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id || caseProposals.length === 0) return []

      const acceptedProposalIds = caseProposals
        .filter(p => p.status === 'won')
        .map(p => p.id)

      if (acceptedProposalIds.length === 0) return []

      const { data, error } = await supabase
        .from('recurring_fees')
        .select('*')
        .eq('org_id', user.org_id)
        .in('proposal_id', acceptedProposalIds)

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id && caseProposals.length > 0,
  })

  // Determine flow status
  const hasProposal = caseProposals.length > 0
  const hasAcceptedProposal = caseProposals.some(p => p.status === 'won')
  const hasRecurringFees = recurringFees.length > 0

  let flowState: CaseFlowStatus['flowState'] = 'no_proposal'
  
  if (hasRecurringFees) {
    flowState = 'has_recurring'
  } else if (hasAcceptedProposal) {
    flowState = 'proposal_accepted'
  } else if (hasProposal) {
    flowState = 'proposal_pending'
  } else if (unbilledHours > 0) {
    flowState = 'ready_to_bill'
  }

  const flowStatus: CaseFlowStatus = {
    hasProposal,
    hasAcceptedProposal,
    hasRecurringFees,
    unbilledHours: Math.round(unbilledHours * 100) / 100,
    unbilledEntries: unbilledEntries.length,
    flowState
  }

  return {
    flowStatus,
    caseProposals,
    recurringFees,
    unbilledEntries,
    refresh: () => {
      // Trigger refetch of all related queries
    }
  }
}