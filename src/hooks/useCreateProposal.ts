
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { CreateProposalData } from '@/types/proposals'

export const useCreateProposal = () => {
  const { user } = useApp()
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

  // Nueva función para crear cuota recurrente automáticamente
  const createRecurringFeeFromProposal = async (proposal: any) => {
    if (!proposal.is_recurring || proposal.status !== 'won') return

    const recurringFeeData = {
      org_id: proposal.org_id,
      client_id: proposal.client_id,
      proposal_id: proposal.id,
      name: `Cuota recurrente - ${proposal.title}`,
      description: proposal.description,
      amount: proposal.retainer_amount || proposal.total_amount,
      frequency: proposal.recurring_frequency || 'monthly',
      start_date: proposal.contract_start_date || new Date().toISOString().split('T')[0],
      end_date: proposal.contract_end_date,
      next_billing_date: proposal.next_billing_date || proposal.contract_start_date || new Date().toISOString().split('T')[0],
      billing_day: proposal.billing_day || 1,
      included_hours: proposal.included_hours || 0,
      hourly_rate_extra: proposal.hourly_rate_extra || 0,
      auto_invoice: true,
      auto_send_notifications: true,
      payment_terms: 30,
      priority: 'medium',
      status: 'active',
      created_by: user?.id
    }

    const { error } = await supabase
      .from('recurring_fees')
      .insert(recurringFeeData)

    if (error) {
      console.error('Error creating recurring fee:', error)
      toast.error('Error al crear cuota recurrente automática')
    } else {
      toast.success('Cuota recurrente creada automáticamente')
    }
  }

  const createProposal = useMutation({
    mutationFn: async (proposalData: CreateProposalData) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      // Preparar datos de propuesta
      const proposalInsert: any = {
        org_id: user.org_id,
        created_by: user.id,
        ...proposalData,
        line_items: undefined // No incluir line_items en el insert principal
      }

      // Si es recurrente y de tipo retainer, calcular la próxima fecha de facturación
      if (proposalData.is_recurring && proposalData.contract_start_date && proposalData.billing_day) {
        const startDate = new Date(proposalData.contract_start_date)
        const nextBilling = new Date(startDate)
        nextBilling.setDate(proposalData.billing_day)
        
        // Si el día ya pasó este mes, mover al siguiente mes
        if (nextBilling <= startDate) {
          nextBilling.setMonth(nextBilling.getMonth() + 1)
        }
        
        proposalInsert.next_billing_date = nextBilling.toISOString().split('T')[0]
      }

      // Crear la propuesta
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert(proposalInsert)
        .select()
        .single()

      if (proposalError) throw proposalError

      // Crear los line items si existen
      if (proposalData.line_items && proposalData.line_items.length > 0) {
        const lineItemsWithProposalId = proposalData.line_items.map(item => ({
          ...item,
          proposal_id: proposal.id
        }))

        const { error: lineItemsError } = await supabase
          .from('proposal_line_items')
          .insert(lineItemsWithProposalId)

        if (lineItemsError) throw lineItemsError
      }

      // Si es retainer y está ganada, crear el contrato retainer
      if (proposal.proposal_type === 'retainer' && proposal.is_recurring && proposal.status === 'won') {
        await createRetainerContract(proposal)
      }

      // Si es recurrente y está ganada, crear cuota recurrente automáticamente
      if (proposal.is_recurring && proposal.status === 'won') {
        await createRecurringFeeFromProposal(proposal)
      }

      return proposal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast.success('Propuesta creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating proposal:', error)
      toast.error('Error al crear la propuesta')
    }
  })

  return {
    createProposal,
    isCreating: createProposal.isPending
  }
}
