
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import type { Proposal } from '@/types/proposals'

export const useUpdateProposalStatus = (proposals: Proposal[]) => {
  const queryClient = useQueryClient()

  const createRetainerContract = async (proposal: any) => {
    const { error } = await supabase
      .from('retainer_contracts')
      .insert({
        org_id: proposal.org_id,
        proposal_id: proposal.id,
        client_id: proposal.client_id,
        retainer_amount: proposal.retainer_amount || 0,
        included_hours: proposal.included_hours || 0,
        hourly_rate_extra: proposal.hourly_rate_extra || 0,
        contract_start_date: proposal.contract_start_date,
        contract_end_date: proposal.contract_end_date,
        next_invoice_date: proposal.next_billing_date
      })

    if (error) {
      console.error('Error creating retainer contract:', error)
      toast.error('Error al crear contrato retainer')
    }
  }

  const updateProposalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Proposal['status'] }) => {
      const proposal = proposals.find(p => p.id === id)
      const updateData: any = { status }
      
      if (status === 'sent' && !proposal?.sent_at) {
        updateData.sent_at = new Date().toISOString()
      }
      
      if (status === 'won') {
        updateData.accepted_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Si la propuesta es de tipo retainer y recurrente, crear el contrato
      if (status === 'won' && data.proposal_type === 'retainer' && data.is_recurring) {
        await createRetainerContract(data)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast.success('Estado actualizado')
    },
    onError: (error) => {
      console.error('Error updating proposal status:', error)
      toast.error('Error al actualizar estado')
    }
  })

  return {
    updateProposalStatus,
    isUpdating: updateProposalStatus.isPending
  }
}
