
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface Proposal {
  id: string
  org_id: string
  client_id: string
  title: string
  description?: string
  status: 'draft' | 'sent' | 'negotiating' | 'won' | 'lost' | 'expired'
  total_amount: number
  currency: string
  proposal_type: 'service' | 'retainer' | 'project'
  valid_until?: string
  sent_at?: string
  accepted_at?: string
  created_by: string
  assigned_to?: string
  notes?: string
  // Campos recurrentes
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  auto_renewal?: boolean
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  next_billing_date?: string
  billing_day?: number
  created_at: string
  updated_at: string
  client?: {
    name: string
    email?: string
  }
  line_items?: ProposalLineItem[]
}

export interface ProposalLineItem {
  id: string
  proposal_id: string
  service_catalog_id?: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  total_price: number
  billing_unit: string
  sort_order: number
}

export interface CreateProposalData {
  client_id: string
  title: string
  description?: string
  proposal_type?: 'service' | 'retainer' | 'project'
  valid_until?: string
  assigned_to?: string
  notes?: string
  // Campos recurrentes
  is_recurring?: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  auto_renewal?: boolean
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  billing_day?: number
  line_items: Omit<ProposalLineItem, 'id' | 'proposal_id'>[]
}

export const useProposals = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: proposals = [], isLoading, error } = useQuery({
    queryKey: ['proposals', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:clients(name, email),
          line_items:proposal_line_items(*)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Proposal[]
    },
    enabled: !!user?.org_id
  })

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

      return proposal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      toast.success('Propuesta creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating proposal:', error)
      toast.error('Error al crear la propuesta')
    }
  })

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

  return {
    proposals,
    isLoading,
    error,
    createProposal,
    updateProposalStatus,
    isCreating: createProposal.isPending,
    isUpdating: updateProposalStatus.isPending
  }
}
