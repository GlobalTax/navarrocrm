
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import type { RecurringFee, RecurringFeeHours, RecurringFeeInvoice, RecurringFeeFilters } from '@/types/recurringFees'

export const useRecurringFees = (filters?: RecurringFeeFilters) => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['recurring-fees', user?.org_id, filters],
    queryFn: async () => {
      if (!user?.org_id) return []

      let query = supabase
        .from('recurring_fees')
        .select(`
          *,
          contacts!contact_id(name, email)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.client_id) {
        query = query.eq('contact_id', filters.client_id)
      }
      if (filters?.frequency && filters.frequency !== 'all') {
        query = query.eq('frequency', filters.frequency)
      }
      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Obtener información de propuestas en una segunda query si existen proposal_ids
      const dataWithProposals = await Promise.all(
        (data || []).map(async (item) => {
          let proposalData = null
          if (item.proposal_id) {
            const { data: proposal } = await supabase
              .from('proposals')
              .select('id, title, proposal_number, status, created_at')
              .eq('id', item.proposal_id)
              .single()
            proposalData = proposal
          }
          
          return {
            ...item,
            client_id: item.contact_id, // Map for backward compatibility
            client: item.contacts ? { 
              name: item.contacts.name || '', 
              email: item.contacts.email 
            } : undefined,
            proposal: proposalData
          }
        })
      )
      
      return dataWithProposals as RecurringFee[]
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
          contacts!contact_id(name, email, phone)
        `)
        .eq('id', id)
        .eq('org_id', user.org_id)
        .single()

      if (error) throw error
      
      // Obtener información de propuesta si existe
      let proposalData = null
      if (data.proposal_id) {
        const { data: proposal } = await supabase
          .from('proposals')
          .select('id, title, proposal_number, status, created_at, total_amount')
          .eq('id', data.proposal_id)
          .single()
        proposalData = proposal
      }
      
      return {
        ...data,
        client_id: data.contact_id, // Map for backward compatibility
        client: data.contacts ? {
          name: data.contacts.name || '',
          email: data.contacts.email,
          phone: data.contacts.phone
        } : undefined,
        proposal: proposalData
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
