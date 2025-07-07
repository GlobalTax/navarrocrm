
import { ProposalWizard } from '@/components/proposals/ProposalWizard'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

interface ProposalsBuilderManagerProps {
  isRecurrentBuilderOpen: boolean
  isSpecificBuilderOpen: boolean
  onCloseRecurrentBuilder: () => void
  onCloseSpecificBuilder: () => void
  onSaveRecurrentProposal: (data: ProposalFormData) => void
  isSavingRecurrent: boolean
  // Nuevas propiedades para edición
  isEditMode?: boolean
  editingProposal?: any
  onUpdateProposal?: (proposalId: string, data: any) => void
}

export const ProposalsBuilderManager = ({
  isRecurrentBuilderOpen,
  isSpecificBuilderOpen,
  onCloseRecurrentBuilder,
  onCloseSpecificBuilder,
  onSaveRecurrentProposal,
  isSavingRecurrent,
  isEditMode = false,
  editingProposal,
  onUpdateProposal
}: ProposalsBuilderManagerProps) => {
  // Mostrar el wizard profesional para ambos tipos de propuestas
  if (isRecurrentBuilderOpen || isSpecificBuilderOpen) {
    return (
      <ProposalWizard
        onBack={isRecurrentBuilderOpen ? onCloseRecurrentBuilder : onCloseSpecificBuilder}
        onSubmit={isEditMode && editingProposal && onUpdateProposal 
          ? (data: any) => onUpdateProposal(editingProposal.id, data)
          : onSaveRecurrentProposal
        }
        isCreating={isSavingRecurrent}
        editingProposal={isEditMode ? editingProposal : undefined}
        isEditMode={isEditMode}
      />
    )
  }

  return null
}
