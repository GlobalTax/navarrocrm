/**
 * Proposals actions - standardized mutations
 */

import { toast } from 'sonner'
import { createMutation } from '@/lib/queries/base'
import { proposalsDAL } from '@/lib/dal'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth'
import type { Proposal } from '@/lib/dal/proposals'

interface CreateProposalData {
  title: string
  description?: string
  contact_id: string
  total_amount: number
  status?: 'draft' | 'sent' | 'won' | 'lost'
}

interface UpdateProposalStatusData {
  id: string
  status: 'draft' | 'sent' | 'won' | 'lost'
}

export const useProposalsActions = (onProposalWon?: (proposal: Proposal) => void) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const createProposalMutation = createMutation<Proposal, CreateProposalData>(
    async (data) => {
      const response = await proposalsDAL.create({
        ...data,
        org_id: user?.org_id,
        status: data.status || 'draft'
      } as any)
      
      if (!response.success) {
        throw response.error || new Error('Failed to create proposal')
      }
      
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['proposals'] })
        toast.success('Propuesta creada exitosamente')
      },
      onError: (error) => {
        toast.error('Error al crear propuesta: ' + error.message)
      }
    }
  )
  
  const updateStatusMutation = createMutation<Proposal, UpdateProposalStatusData>(
    async ({ id, status }) => {
      const response = await proposalsDAL.update(id, { status } as any)
      
      if (!response.success) {
        throw response.error || new Error('Failed to update proposal status')
      }
      
      return response.data
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['proposals'] })
        
        if (data.status === 'won' && onProposalWon) {
          onProposalWon(data)
        }
        
        toast.success('Estado de propuesta actualizado')
      },
      onError: (error) => {
        toast.error('Error al actualizar estado: ' + error.message)
      }
    }
  )
  
  return {
    createProposal: createProposalMutation.mutate,
    createProposalAsync: createProposalMutation.mutateAsync,
    isCreating: createProposalMutation.isLoading,
    
    updateProposalStatus: Object.assign(updateStatusMutation.mutate, {
      mutate: updateStatusMutation.mutate,
      mutateAsync: updateStatusMutation.mutateAsync
    }),
    updateProposalStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isLoading,
    
    // Legacy placeholders for backward compatibility
    updateProposal: () => {},
    deleteProposal: () => {},
    duplicateProposal: () => {},
  }
}