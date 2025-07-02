
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { Proposal } from '@/types/proposals'

export const useUpdateProposalStatus = (proposals: Proposal[], onProposalWon?: (proposal: any) => void) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Función para crear cuota recurrente cuando se acepta una propuesta
  const createRecurringFeeOnAcceptance = async (proposal: any) => {
    if (!proposal.is_recurring || !user?.id) return

    const recurringFeeData = {
      org_id: proposal.org_id,
      contact_id: proposal.contact_id,  // Changed from client_id to contact_id
      proposal_id: proposal.id,
      name: `Cuota recurrente - ${proposal.title}`,
      description: proposal.description || '',
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
      created_by: user.id
    }

    // Verificar si ya existe una cuota recurrente para esta propuesta
    const { data: existingFee } = await supabase
      .from('recurring_fees')
      .select('id')
      .eq('proposal_id', proposal.id)
      .single()

    if (!existingFee) {
      const { error } = await supabase
        .from('recurring_fees')
        .insert(recurringFeeData)

      if (error) {
        console.error('Error creating recurring fee:', error)
        toast.error('Error al crear cuota recurrente automática')
      } else {
        toast.success('✅ Cuota recurrente creada automáticamente')
      }
    }
  }

  const updateProposalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      // Si se acepta la propuesta, agregar fechas relevantes
      if (status === 'won') {
        updateData.accepted_at = new Date().toISOString()
        
        // Si no tiene fecha de inicio de contrato, usar la fecha actual
        const proposal = proposals.find(p => p.id === id)
        if (proposal?.is_recurring && !proposal.contract_start_date) {
          updateData.contract_start_date = new Date().toISOString().split('T')[0]
        }
      }

      const { data, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Si se acepta una propuesta, crear la cuota recurrente y disparar onboarding
      if (status === 'won') {
        await createRecurringFeeOnAcceptance(data)
        // Callback para iniciar onboarding
        onProposalWon?.(data)
      }

      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      
      const statusText = variables.status === 'won' ? 'aceptada' : 
                        variables.status === 'lost' ? 'rechazada' : 
                        'actualizada'
      
      toast.success(`Propuesta ${statusText} correctamente`)
    },
    onError: (error) => {
      console.error('Error updating proposal status:', error)
      toast.error('Error al actualizar el estado de la propuesta')
    }
  })

  return {
    updateProposalStatus,
    isUpdating: updateProposalStatus.isPending
  }
}
