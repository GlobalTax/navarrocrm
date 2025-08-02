import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveProposal } from '../services/proposal.service'
import { toast } from 'sonner'
import { proposalsLogger } from '@/utils/logging'
import type { ProposalFormData } from '../types/proposal.schema'

export const useSaveProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalData: ProposalFormData) => {
      proposalsLogger.info('Iniciando guardado de propuesta', { proposal: proposalData })
      return await saveProposal(proposalData)
    },
    onSuccess: (data) => {
      proposalsLogger.info('Propuesta guardada exitosamente', { proposalId: data.id })
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposal-metrics'] })
      
      toast.success('Propuesta guardada correctamente')
      return data
    },
    onError: (error: any) => {
      proposalsLogger.error('Error al guardar propuesta', { error })
      toast.error(error.message || 'Error al guardar la propuesta')
      throw error
    }
  })
}