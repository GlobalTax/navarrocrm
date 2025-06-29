
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveProposal as saveProposalService } from '../services/proposal.service';
import { ProposalFormData } from '../types/proposal.schema';
import { toast } from 'sonner';

interface SaveProposalPayload {
  proposalData: ProposalFormData;
  orgId: string;
  userId: string;
}

export const useSaveProposal = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ proposalData, orgId, userId }: SaveProposalPayload) => {
      console.log('Guardando propuesta con datos:', { 
        ...proposalData, 
        is_recurring: proposalData.is_recurring,
        recurring_frequency: proposalData.recurring_frequency 
      });
      
      // Asegurar que is_recurring se mantenga correctamente
      const dataToSave = {
        ...proposalData,
        is_recurring: Boolean(proposalData.is_recurring), // Forzar boolean
        recurring_frequency: proposalData.is_recurring ? proposalData.recurring_frequency : null
      };
      
      return saveProposalService(dataToSave, orgId, userId);
    },
    onSuccess: (data) => {
      console.log('Propuesta guardada exitosamente:', {
        id: data.id,
        title: data.title,
        is_recurring: data.is_recurring,
        recurring_frequency: data.recurring_frequency
      });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success(`Propuesta "${data.title}" guardada con éxito`);
    },
    onError: (error: Error) => {
      console.error('Error al guardar propuesta:', error);
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  return mutation;
};
