
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

interface ProposalsPageHandlersProps {
  updateProposalStatus: any
  saveRecurrentProposal: any
  user: any
  closeRecurrentBuilder: () => void
}

export const useProposalsPageHandlers = ({
  updateProposalStatus,
  saveRecurrentProposal,
  user,
  closeRecurrentBuilder,
}: ProposalsPageHandlersProps) => {
  
  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutate({ id, status })
  }

  const handleViewProposal = (proposal: any) => {
    console.log('Ver propuesta:', proposal)
  }

  const handleSaveRecurrentProposal = (data: ProposalFormData) => {
    console.log('Handling save recurrent proposal:', data)
    if (!user || !user.org_id) {
      console.error("User or org_id is not available. Cannot save proposal.")
      return
    }
    
    // Crear datos de propuesta recurrente con las propiedades correctas
    const recurrentProposalData: ProposalFormData = {
      ...data,
      is_recurring: true,
      recurring_frequency: data.recurring_frequency || 'monthly',
    }
    
    saveRecurrentProposal({
      proposalData: recurrentProposalData,
      orgId: user.org_id,
      userId: user.id,
    })
    closeRecurrentBuilder()
  }

  return {
    handleStatusChange,
    handleViewProposal,
    handleSaveRecurrentProposal
  }
}
