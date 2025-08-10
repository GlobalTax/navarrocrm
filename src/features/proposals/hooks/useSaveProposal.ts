import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveProposal } from '../services/proposal.service'
import { toast } from 'sonner'
import type { ProposalFormData } from '@/types/proposals/forms'

export const useSaveProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalData: ProposalFormData) => {
      console.log('🚀 useSaveProposal - Iniciando guardado:', proposalData)
      return await saveProposal(proposalData)
    },
    onSuccess: (data) => {
      console.log('✅ Propuesta guardada exitosamente:', data.id)
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposal-metrics'] })
      
      toast.success('Propuesta guardada correctamente')
      return data
    },
    onError: (error: any) => {
      console.error('❌ Error al guardar propuesta:', error)
      toast.error(error.message || 'Error al guardar la propuesta')
      throw error
    }
  })
}