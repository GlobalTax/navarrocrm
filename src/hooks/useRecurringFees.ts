import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useToast } from '@/hooks/use-toast'

export interface RecurringFee {
  id: string
  org_id: string
  client_id: string
  proposal_id?: string
  name: string
  description?: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  next_billing_date: string
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  billing_day: number
  included_hours: number
  hourly_rate_extra: number
  auto_invoice: boolean
  auto_send_notifications: boolean
  payment_terms: number
  priority: 'high' | 'medium' | 'low'
  tags?: string[]
  internal_notes?: string
  created_at: string
  updated_at: string
  created_by: string
  client?: {
    name: string
    email?: string
  }
}

export interface RecurringFeeHours {
  id: string
  recurring_fee_id: string
  billing_period_start: string
  billing_period_end: string
  included_hours: number
  hours_used: number
  extra_hours: number
  hourly_rate?: number
  extra_amount: number
  created_at: string
  updated_at: string
}

export interface RecurringFeeInvoice {
  id: string
  recurring_fee_id: string
  invoice_number?: string
  invoice_date: string
  due_date: string
  billing_period_start: string
  billing_period_end: string
  base_amount: number
  extra_hours_amount: number
  total_amount: number
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  sent_at?: string
  paid_at?: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export const useRecurringFees = (filters?: {
  status?: string
  client_id?: string
  frequency?: string
  priority?: string
}) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['recurring-fees', user?.org_id, filters],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('recurring_fees')
        .select(`
          *,
          clients!inner(name, email)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id)
      }
      if (filters?.frequency && filters.frequency !== 'all') {
        query = query.eq('frequency', filters.frequency)
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority)
      }

      const { data, error } = await query

      if (error) throw error
      
      return (data || []).map(item => ({
        ...item,
        client: item.clients ? { 
          name: item.clients.name || '', 
          email: item.clients.email 
        } : undefined
      })) as RecurringFee[]
    },
    enabled: !!user?.org_id
  })
}

export const useRecurringFee = (id: string) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['recurring-fee', id],
    queryFn: async () => {
      if (!user?.org_id || !id) return null

      const { data, error } = await supabase
        .from('recurring_fees')
        .select(`
          *,
          clients!inner(name, email, phone),
          proposals(title, proposal_number)
        `)
        .eq('id', id)
        .eq('org_id', user.org_id)
        .single()

      if (error) throw error
      
      return {
        ...data,
        client: data.clients ? {
          name: data.clients.name || '',
          email: data.clients.email,
          phone: data.clients.phone
        } : undefined
      }
    },
    enabled: !!user?.org_id && !!id
  })
}

export const useRecurringFeeHours = (recurringFeeId: string) => {
  return useQuery({
    queryKey: ['recurring-fee-hours', recurringFeeId],
    queryFn: async () => {
      if (!recurringFeeId) return []

      const { data, error } = await supabase
        .from('recurring_fee_hours')
        .select('*')
        .eq('recurring_fee_id', recurringFeeId)
        .order('billing_period_start', { ascending: false })

      if (error) throw error
      return data as RecurringFeeHours[]
    },
    enabled: !!recurringFeeId
  })
}

export const useRecurringFeeInvoices = (recurringFeeId: string) => {
  return useQuery({
    queryKey: ['recurring-fee-invoices', recurringFeeId],
    queryFn: async () => {
      if (!recurringFeeId) return []

      const { data, error } = await supabase
        .from('recurring_fee_invoices')
        .select('*')
        .eq('recurring_fee_id', recurringFeeId)
        .order('invoice_date', { ascending: false })

      if (error) throw error
      return data as RecurringFeeInvoice[]
    },
    enabled: !!recurringFeeId
  })
}

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

// Nuevo hook para crear cuota recurrente desde propuesta
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
