
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
    mutationFn: ({ proposalData, orgId, userId }: SaveProposalPayload) => 
      saveProposalService(proposalData, orgId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success(`Propuesta "${data.title}" guardada con éxito`);
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  return mutation;
};
