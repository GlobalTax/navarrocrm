
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'
import type { RecurringFee } from '@/types/recurringFees'

export const useCreateRecurringFee = () => {
  const { user } = useApp()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<RecurringFee, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      const { data: result, error } = await supabase
        .from('recurring_fees')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast({
        title: 'Éxito',
        description: 'Cuota recurrente creada correctamente'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la cuota recurrente',
        variant: 'destructive'
      })
    }
  })
}

export const useUpdateRecurringFee = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecurringFee> }) => {
      const { data: result, error } = await supabase
        .from('recurring_fees')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-fee'] })
      toast({
        title: 'Éxito',
        description: 'Cuota recurrente actualizada correctamente'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar la cuota recurrente',
        variant: 'destructive'
      })
    }
  })
}

export const useDeleteRecurringFee = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_fees')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast({
        title: 'Éxito',
        description: 'Cuota recurrente eliminada correctamente'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar la cuota recurrente',
        variant: 'destructive'
      })
    }
  })
}

export const useGenerateInvoices = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('generate_recurring_invoices')
      if (error) throw error
      return data
    },
    onSuccess: (invoicesGenerated) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fee-invoices'] })
      toast({
        title: 'Éxito',
        description: `Se generaron ${invoicesGenerated} facturas automáticamente`
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al generar facturas',
        variant: 'destructive'
      })
    }
  })
}

export const useCreateRecurringFeeFromProposal = () => {
  const { user } = useApp()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      // Obtener datos de la propuesta
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .eq('org_id', user.org_id)
        .single()

      if (proposalError) throw proposalError

      // Crear cuota recurrente basada en la propuesta
      const recurringFeeData = {
        org_id: user.org_id,
        client_id: proposal.client_id,
        proposal_id: proposal.id,
        name: `Cuota recurrente - ${proposal.title}`,
        description: proposal.description || '',
        amount: proposal.retainer_amount || proposal.total_amount,
        frequency: proposal.recurring_frequency as 'monthly' | 'quarterly' | 'yearly',
        start_date: proposal.contract_start_date || new Date().toISOString().split('T')[0],
        end_date: proposal.contract_end_date,
        next_billing_date: proposal.next_billing_date || proposal.contract_start_date || new Date().toISOString().split('T')[0],
        billing_day: proposal.billing_day || 1,
        included_hours: proposal.included_hours || 0,
        hourly_rate_extra: proposal.hourly_rate_extra || 0,
        auto_invoice: true,
        auto_send_notifications: true,
        payment_terms: 30,
        priority: 'medium' as const,
        status: 'active' as const,
        created_by: user.id
      }

      const { data: result, error } = await supabase
        .from('recurring_fees')
        .insert(recurringFeeData)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast({
        title: 'Éxito',
        description: 'Cuota recurrente creada desde propuesta'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la cuota desde propuesta',
        variant: 'destructive'
      })
    }
  })
}
