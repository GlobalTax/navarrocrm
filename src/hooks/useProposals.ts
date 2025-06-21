
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

      // Crear la propuesta
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          org_id: user.org_id,
          created_by: user.id,
          ...proposalData,
          line_items: undefined // No incluir line_items en el insert principal
        })
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
      const updateData: any = { status }
      
      if (status === 'sent' && !proposals.find(p => p.id === id)?.sent_at) {
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
    proposals,
    isLoading,
    error,
    createProposal,
    updateProposalStatus,
    isCreating: createProposal.isPending,
    isUpdating: updateProposalStatus.isPending
  }
}
